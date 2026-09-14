import { fail, redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { ADMIN_PASSWORD } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { createShipment, generateLabel, requestPickup } from '$lib/server/shiprocket';
import type { Actions, PageServerLoad } from './$types';

const COOKIE_NAME = 'loka_admin';

function expectedToken() {
	return crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
}

export const load: PageServerLoad = async ({ cookies }) => {
	const authed = cookies.get(COOKIE_NAME) === expectedToken();
	if (!authed) throw redirect(303, '/admin');

	const { data } = await supabaseAdmin
		.from('orders')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(100);

	return { orders: data ?? [] };
};

async function rebuildShipmentItems(items: { id: string; qty: number }[]) {
	const { data: products } = await supabaseAdmin
		.from('products')
		.select('id, name, price_inr, weight_grams, length_cm, breadth_cm, height_cm')
		.in(
			'id',
			items.map((i) => i.id)
		);

	return items.map((line) => {
		const p = products?.find((pr) => pr.id === line.id);
		return {
			name: p?.name ?? 'Item',
			sku: line.id.slice(0, 8),
			units: line.qty,
			selling_price: p?.price_inr ?? 0,
			weight_grams: p?.weight_grams ?? 300,
			length_cm: p?.length_cm ?? 12,
			breadth_cm: p?.breadth_cm ?? 10,
			height_cm: p?.height_cm ?? 6
		};
	});
}

export const actions: Actions = {
	retryShipment: async ({ request, cookies }) => {
		if (cookies.get(COOKIE_NAME) !== expectedToken()) throw redirect(303, '/admin');

		const form = await request.formData();
		const orderId = form.get('orderId') as string;

		const { data: order } = await supabaseAdmin
			.from('orders')
			.select('*')
			.eq('id', orderId)
			.single();

		if (!order) return fail(404, { message: 'Order not found' });
		if (!order.delivery_address || !order.customer_name || !order.customer_phone) {
			return fail(400, { message: 'Order is missing name, phone, or address' });
		}

		try {
			const items = await rebuildShipmentItems(order.items);
			const shipment = await createShipment({
				orderId: order.id,
				customerName: order.customer_name,
				customerPhone: order.customer_phone,
				deliveryAddress: order.delivery_address,
				items,
				totalInr: order.total_inr,
				paymentMethod: 'Prepaid'
			});

			await supabaseAdmin
				.from('orders')
				.update({
					shiprocket_order_id: shipment.shiprocketOrderId,
					shiprocket_shipment_id: shipment.shipmentId,
					awb_code: shipment.awbCode,
					courier_name: shipment.courierName,
					shipment_status: shipment.status,
					shipment_error: shipment.error
				})
				.eq('id', order.id);
		} catch (err) {
			await supabaseAdmin
				.from('orders')
				.update({ shipment_status: 'failed', shipment_error: (err as Error).message })
				.eq('id', order.id);
			return fail(500, { message: (err as Error).message });
		}
	},

	fetchLabel: async ({ request, cookies }) => {
		if (cookies.get(COOKIE_NAME) !== expectedToken()) throw redirect(303, '/admin');

		const form = await request.formData();
		const orderId = form.get('orderId') as string;
		const shipmentId = form.get('shipmentId') as string;

		try {
			const labelUrl = await generateLabel(shipmentId);
			await supabaseAdmin.from('orders').update({ label_url: labelUrl }).eq('id', orderId);
		} catch (err) {
			return fail(500, { message: (err as Error).message });
		}
	},

	retryPickup: async ({ request, cookies }) => {
		if (cookies.get(COOKIE_NAME) !== expectedToken()) throw redirect(303, '/admin');

		const form = await request.formData();
		const orderId = form.get('orderId') as string;
		const shipmentId = form.get('shipmentId') as string;

		try {
			await requestPickup(shipmentId);
			await supabaseAdmin
				.from('orders')
				.update({ shipment_status: 'pickup_scheduled', shipment_error: null })
				.eq('id', orderId);
		} catch (err) {
			return fail(500, { message: (err as Error).message });
		}
	}
};
