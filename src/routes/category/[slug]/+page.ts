import { supabase } from '$lib/supabase';
import { getCategory } from '$lib/categories';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const category = getCategory(params.slug);
	if (!category) throw error(404, 'Category not found');

	const { data, error: dbError } = await supabase
		.from('products')
		.select('*')
		.eq('category', params.slug)
		.order('created_at', { ascending: false });

	if (dbError) {
		// Supabase not configured yet — show empty state instead of crashing the page.
		return { category, products: [] };
	}

	return { category, products: data ?? [] };
};
