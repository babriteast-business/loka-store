import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
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
	const items = JSON.parse((order.notes?.items as string) ?? '[]') as {
		id: string;
		qty: number;
	}[];

	const { error: insertError } = await supabaseAdmin.from('orders').insert({
		razorpay_order_id,
		razorpay_payment_id,
		customer_name: customer?.name ?? null,
		customer_phone: customer?.phone ?? null,
		delivery_address: customer?.address ?? null,
		items,
		total_inr: Number(order.amount) / 100,
		status: 'paid'
	});

	if (insertError) {
		// Payment is genuinely valid even if this write fails — don't tell the
		// customer it failed. Log it so you can reconcile manually.
		console.error('Order insert failed after valid payment:', insertError, {
			razorpay_order_id,
			razorpay_payment_id
		});
	}

	// Best-effort stock decrement per item.
	for (const item of items) {
		await supabaseAdmin.rpc('decrement_stock', { p_id: item.id, p_qty: item.qty });
	}

	return json({ valid: true });
};
