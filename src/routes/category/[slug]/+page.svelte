<script lang="ts">
	import type { PageData } from './$types';
	import { tilt } from '$lib/actions/tilt';
	import CategoryIcon3D from '$lib/components/CategoryIcon3D.svelte';

	export let data: PageData;

	// Bestsellers first — surfaces your proven movers instead of a flat
	// chronological list, which nudges undecided browsers toward what's
	// already selling.
	$: sortedProducts = [...data.products].sort(
		(a, b) => Number(b.bestseller) - Number(a.bestseller)
	);

	function discountPct(price: number, compareAt: number | null) {
		if (!compareAt || compareAt <= price) return null;
		return Math.round(((compareAt - price) / compareAt) * 100);
	}
</script>

<svelte:head>
	<title>{data.category.name} — Loka</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-6 py-12">
	<div class="mb-8 flex items-center gap-4">
		<CategoryIcon3D category={data.category} size={84} />
		<div>
			<h1 class="font-display text-3xl">{data.category.name}</h1>
			<p class="text-sm text-ink/60">{data.category.tagline}</p>
		</div>
	</div>

	{#if sortedProducts.length === 0}
		<div class="rounded-2xl border border-dashed border-line p-10 text-center text-ink/60">
			No products listed here yet. Add one from <a href="/admin" class="underline">/admin</a>
			with category set to "{data.category.name}".
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
			{#each sortedProducts as product (product.id)}
				{@const pct = discountPct(product.price_inr, product.compare_at_inr)}
				<a href="/product/{product.id}" class="group">
					<div
						use:tilt={10}
						class="relative aspect-square overflow-hidden rounded-xl bg-line shadow-sm"
					>
						<img
							src={product.image_url}
							alt={product.name}
							class="h-full w-full object-cover"
							loading="lazy"
						/>
						<div class="absolute left-2 top-2 flex flex-col gap-1">
							{#if product.bestseller}
								<span class="rounded-full bg-marigold px-2 py-0.5 text-xs font-medium text-ink">
									Bestseller
								</span>
							{/if}
							{#if pct}
								<span class="rounded-full bg-rust px-2 py-0.5 text-xs font-medium text-paper">
									{pct}% off
								</span>
							{/if}
						</div>
						{#if product.stock > 0 && product.stock <= 10}
							<span
								class="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs text-paper"
							>
								Only {product.stock} left
							</span>
						{/if}
					</div>
					<h3 class="mt-3 text-sm font-medium">{product.name}</h3>
					<div class="flex items-baseline gap-2">
						<p class="text-sm font-medium">₹{product.price_inr}</p>
						{#if product.compare_at_inr}
							<p class="text-xs text-ink/40 line-through">₹{product.compare_at_inr}</p>
						{/if}
					</div>
					{#if product.units_sold > 20}
						<p class="text-xs text-ink/40">{product.units_sold}+ sold</p>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</section>
