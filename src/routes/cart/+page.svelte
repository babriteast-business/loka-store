<script lang="ts">
	import { cart } from '$lib/stores/cart';

	$: subtotal = $cart.reduce((sum, i) => sum + i.price_inr * i.qty, 0);
</script>

<svelte:head>
	<title>Your cart — Loka</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-6 py-12">
	<h1 class="font-display text-3xl">Your cart</h1>

	{#if $cart.length === 0}
		<p class="mt-6 text-ink/60">Nothing here yet. <a href="/" class="underline">Keep browsing</a>.</p>
	{:else}
		<div class="mt-8 divide-y divide-line">
			{#each $cart as item (item.id)}
				<div class="flex items-center gap-4 py-4">
					<img src={item.image_url} alt={item.name} class="h-16 w-16 rounded-lg object-cover" />
					<div class="flex-1">
						<p class="font-medium">{item.name}</p>
						<p class="text-sm text-ink/60">₹{item.price_inr}</p>
					</div>
					<input
						type="number"
						min="0"
						value={item.qty}
						on:change={(e) => cart.setQty(item.id, Number(e.currentTarget.value))}
						class="w-16 rounded-lg border border-line px-2 py-1 text-center"
					/>
					<button on:click={() => cart.remove(item.id)} class="text-sm text-ink/40 hover:text-rust">
						Remove
					</button>
				</div>
			{/each}
		</div>

		<div class="mt-8 flex items-center justify-between">
			<span class="text-lg font-medium">Subtotal: ₹{subtotal}</span>
			<a
				href="/checkout"
				class="rounded-full bg-ink px-8 py-3 font-medium text-paper hover:opacity-90"
			>
				Checkout
			</a>
		</div>
	{/if}
</section>
