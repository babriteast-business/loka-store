import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { createShipment } from '$lib/server/shiprocket';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer } =
		await request.json();

	const expected = crypto
		.createHmac('sha256', RAZORPAY_KEY_SECRET)
		.update(`${razorpay_order_id}|${razorpay_payment_id}`)
		.digest('hex');

	const valid = expected === razorpay_signature;
	if (!valid) return json({ valid: false });

	// Pull the item list back off the Razorpay order's notes — this is the
	// server-computed cart from create-order, not anything the client could edit.
	const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
	const order = await razorpay.orders.fetch(razorpay_order_id);
	const cartItems = JSON.parse((order.notes?.items as string) ?? '[]') as {
		id: string;
		qty: number;
	}[];
	const totalInr = Number(order.amount) / 100;

	const { data: insertedOrder, error: insertError } = await supabaseAdmin
		.from('orders')
		.insert({
			razorpay_order_id,
			razorpay_payment_id,
			customer_name: customer?.name ?? null,
			customer_phone: customer?.phone ?? null,
			delivery_address: customer?.address ?? null,
			items: cartItems,
			total_inr: totalInr,
			status: 'paid'
		})
		.select()
		.single();

	if (insertError) {
		// Payment is genuinely valid even if this write fails — don't tell the
		// customer it failed. Log it so you can reconcile manually.
		console.error('Order insert failed after valid payment:', insertError, {
			razorpay_order_id,
			razorpay_payment_id
		});
	}

	// Best-effort stock decrement per item.
	for (const item of cartItems) {
		await supabaseAdmin.rpc('decrement_stock', { p_id: item.id, p_qty: item.qty });
	}

	// Automatically create the Shiprocket shipment — this is the "warehouse
	// to delivery" automation. Runs best-effort: if it fails (bad pincode,
	// missing Shiprocket setup, etc.) the payment still succeeds and the
	// order is still saved; you just retry shipment creation from /admin/orders.
	if (insertedOrder && customer?.address && customer?.name && customer?.phone) {
		try {
			const { data: products } = await supabaseAdmin
				.from('products')
				.select('id, name, price_inr, weight_grams, length_cm, breadth_cm, height_cm')
				.in(
					'id',
					cartItems.map((i) => i.id)
				);

			const shipmentItems = cartItems.map((line) => {
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

			const shipment = await createShipment({
				orderId: insertedOrder.id,
				customerName: customer.name,
				customerPhone: customer.phone,
				deliveryAddress: customer.address,
				items: shipmentItems,
				totalInr,
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
				.eq('id', insertedOrder.id);
		} catch (err) {
			console.error('Shiprocket shipment creation failed:', err, { orderId: insertedOrder.id });
			await supabaseAdmin
				.from('orders')
				.update({ shipment_status: 'failed', shipment_error: (err as Error).message })
				.eq('id', insertedOrder.id);
		}
	}

	return json({ valid: true });
};
