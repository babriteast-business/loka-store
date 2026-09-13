import { fail, redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { ADMIN_PASSWORD } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { categories } from '$lib/categories';
import type { Actions, PageServerLoad } from './$types';

const COOKIE_NAME = 'loka_admin';

function expectedToken() {
	// Not a real session system — fine for a single-owner admin panel behind a
	// shared password. Swap for proper auth before adding more admin users.
	return crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
}

export const load: PageServerLoad = async ({ cookies }) => {
	const authed = cookies.get(COOKIE_NAME) === expectedToken();
	if (!authed) return { authed: false, products: [] };

	const { data } = await supabaseAdmin
		.from('products')
		.select('*')
		.order('created_at', { ascending: false });

	return { authed: true, products: data ?? [], categories };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const form = await request.formData();
		const password = form.get('password');
		if (password !== ADMIN_PASSWORD) {
			return fail(401, { message: 'Wrong password' });
		}
		cookies.set(COOKIE_NAME, expectedToken(), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 8 // 8 hours
		});
	},

	logout: async ({ cookies }) => {
		cookies.delete(COOKIE_NAME, { path: '/' });
	},

	addProduct: async ({ request, cookies }) => {
		if (cookies.get(COOKIE_NAME) !== expectedToken()) throw redirect(303, '/admin');

		const form = await request.formData();
		const { error } = await supabaseAdmin.from('products').insert({
			name: form.get('name'),
			slug: String(form.get('name')).toLowerCase().replace(/\s+/g, '-').slice(0, 60),
			category: form.get('category'),
			price_inr: Number(form.get('price_inr')),
			compare_at_inr: form.get('compare_at_inr') ? Number(form.get('compare_at_inr')) : null,
			description: form.get('description'),
			image_url: form.get('image_url'),
			stock: Number(form.get('stock')),
			bestseller: form.get('bestseller') === 'on',
			source_note: form.get('source_note')
		});

		if (error) return fail(500, { message: error.message });
	},

	deleteProduct: async ({ request, cookies }) => {
		if (cookies.get(COOKIE_NAME) !== expectedToken()) throw redirect(303, '/admin');

		const form = await request.formData();
		const id = form.get('id');
		await supabaseAdmin.from('products').delete().eq('id', id);
	},

	toggleBestseller: async ({ request, cookies }) => {
		if (cookies.get(COOKIE_NAME) !== expectedToken()) throw redirect(303, '/admin');

		const form = await request.formData();
		const id = form.get('id');
		const current = form.get('current') === 'true';
		await supabaseAdmin.from('products').update({ bestseller: !current }).eq('id', id);
	}
};
