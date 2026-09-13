import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export type Product = {
	id: string;
	name: string;
	slug: string;
	category: string;
	price_inr: number;
	compare_at_inr: number | null;
	description: string;
	image_url: string;
	stock: number;
	bestseller: boolean;
	units_sold: number;
	source_note: string | null;
};
