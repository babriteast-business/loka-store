<script lang="ts">
	import type { PageData } from './$types';
	import { cart } from '$lib/stores/cart';
	import { tilt } from '$lib/actions/tilt';

	export let data: PageData;
	const p = data.product;

	let added = false;
	function addToCart() {
		cart.add({
			id: p.id,
			name: p.name,
			price_inr: p.price_inr,
			image_url: p.image_url
		});
		added = true;
		setTimeout(() => (added = false), 1500);
	}

	$: discountPct =
		p.compare_at_inr && p.compare_at_inr > p.price_inr
			? Math.round(((p.compare_at_inr - p.price_inr) / p.compare_at_inr) * 100)
			: null;
</script>

<svelte:head>
	<title>{p.name} — Loka</title>
</svelte:head>

<section class="mx-auto grid max-w-6xl gap-10 px-6 py-12 pb-28 sm:grid-cols-2 sm:pb-12">
	<div use:tilt={6} class="relative aspect-square overflow-hidden rounded-2xl bg-line shadow-sm">
		<img src={p.image_url} alt={p.name} class="h-full w-full object-cover" />
		<div class="absolute left-3 top-3 flex flex-col gap-1">
			{#if p.bestseller}
				<span class="rounded-full bg-marigold px-2.5 py-1 text-xs font-medium text-ink">Bestseller</span>
			{/if}
			{#if discountPct}
				<span class="rounded-full bg-rust px-2.5 py-1 text-xs font-medium text-paper">{discountPct}% off</span>
			{/if}
		</div>
	</div>

	<div>
		<h1 class="font-display text-3xl">{p.name}</h1>
		<div class="mt-3 flex items-baseline gap-3">
			<span class="text-2xl font-medium">₹{p.price_inr}</span>
			{#if p.compare_at_inr}
				<span class="text-ink/40 line-through">₹{p.compare_at_inr}</span>
			{/if}
		</div>

		{#if p.units_sold > 20}
			<p class="mt-1 text-sm text-teal">{p.units_sold}+ people have bought this</p>
		{/if}
		{#if p.stock > 0 && p.stock <= 10}
			<p class="mt-1 text-sm text-rust">Only {p.stock} left in stock</p>
		{/if}

		<p class="mt-5 text-ink/75">{p.description}</p>

		<button
			on:click={addToCart}
			class="mt-8 hidden w-full rounded-full bg-ink py-3 font-medium text-paper transition-opacity hover:opacity-90 sm:block sm:w-auto sm:px-10"
		>
			{added ? 'Added ✓' : 'Add to cart'}
		</button>

		<p class="mt-4 text-xs text-ink/40">
			{p.stock > 0 ? `${p.stock} in stock` : 'Currently out of stock'}
		</p>

		<div class="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-6 text-xs text-ink/60">
			<div class="flex items-center gap-2">
				<span class="h-1.5 w-1.5 rounded-full bg-teal" /> Secure checkout via Razorpay
			</div>
			<div class="flex items-center gap-2">
				<span class="h-1.5 w-1.5 rounded-full bg-teal" /> Delivered across India
			</div>
		</div>
	</div>
</section>

<!-- Sticky mobile add-to-cart bar — keeps the CTA reachable without scrolling
     back up, which is where a lot of mobile checkouts get abandoned. -->
<div
	class="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-paper/95 px-6 py-3 backdrop-blur sm:hidden"
>
	<span class="font-medium">₹{p.price_inr}</span>
	<button
		on:click={addToCart}
		class="flex-1 rounded-full bg-ink py-2.5 font-medium text-paper max-w-[60%]"
	>
		{added ? 'Added ✓' : 'Add to cart'}
	</button>
</div>
