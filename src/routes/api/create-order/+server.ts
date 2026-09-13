import { json, error } from '@sveltejs/kit';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import type { RequestHandler } from './$types';

type CartLine = { id: string; qty: number };

// The client sends only { id, qty } pairs — never a price or total. We look up
// the real price for every id in Supabase and compute the total ourselves, so
// no one can pay less by editing the browser's cart state or the network request.
export const POST: RequestHandler = async ({ request }) => {
	const { items } = (await request.json()) as { items: CartLine[] };

	if (!items?.length) throw error(400, 'Cart is empty');

	const ids = items.map((i) => i.id);
	const { data: products, error: dbError } = await supabaseAdmin
		.from('products')
		.select('id, price_inr, stock')
		.in('id', ids);

	if (dbError || !products) throw error(500, 'Could not verify cart against catalog');

	let amountInPaise = 0;
	for (const line of items) {
		const product = products.find((p) => p.id === line.id);
		if (!product) throw error(400, `Product ${line.id} no longer exists`);
		if (product.stock < line.qty) throw error(400, `Not enough stock for ${line.id}`);
		amountInPaise += product.price_inr * line.qty * 100;
	}

	const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

	const order = await razorpay.orders.create({
		amount: amountInPaise,
		currency: 'INR',
		receipt: `loka_${Date.now()}`,
		notes: { items: JSON.stringify(items) }
	});

	return json({ order });
};
