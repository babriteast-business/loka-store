import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type CartItem = {
	id: string;
	name: string;
	price_inr: number;
	image_url: string;
	qty: number;
};

function loadInitial(): CartItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem('loka_cart');
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function createCart() {
	const { subscribe, update, set } = writable<CartItem[]>(loadInitial());

	function persist(items: CartItem[]) {
		if (browser) localStorage.setItem('loka_cart', JSON.stringify(items));
	}

	return {
		subscribe,
		add(item: Omit<CartItem, 'qty'>, qty = 1) {
			update((items) => {
				const existing = items.find((i) => i.id === item.id);
				const next = existing
					? items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i))
					: [...items, { ...item, qty }];
				persist(next);
				return next;
			});
		},
		setQty(id: string, qty: number) {
			update((items) => {
				const next =
					qty <= 0
						? items.filter((i) => i.id !== id)
						: items.map((i) => (i.id === id ? { ...i, qty } : i));
				persist(next);
				return next;
			});
		},
		remove(id: string) {
			update((items) => {
				const next = items.filter((i) => i.id !== id);
				persist(next);
				return next;
			});
		},
		clear() {
			set([]);
			persist([]);
		}
	};
}

export const cart = createCart();
