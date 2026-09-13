import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { data, error: dbError } = await supabase
		.from('products')
		.select('*')
		.eq('id', params.id)
		.single();

	if (dbError || !data) throw error(404, 'Product not found');

	return { product: data };
};
