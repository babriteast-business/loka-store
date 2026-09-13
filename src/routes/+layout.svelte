<script lang="ts">
	import '../app.css';
	import { cart } from '$lib/stores/cart';

	$: itemCount = $cart.reduce((sum, i) => sum + i.qty, 0);
</script>

<div class="min-h-screen flex flex-col">
	<header class="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href="/" class="font-display text-2xl">Loka</a>
			<nav class="hidden gap-6 text-sm font-medium sm:flex">
				<a href="/category/home-care" class="hover:text-teal">Home Care</a>
				<a href="/category/personal-care" class="hover:text-teal">Personal Care</a>
				<a href="/category/kitchen-accessories" class="hover:text-teal">Kitchen</a>
				<a href="/category/kids-section" class="hover:text-teal">Kids</a>
				<a href="/category/electronics" class="hover:text-teal">Electronics</a>
			</nav>
			<a href="/cart" class="relative rounded-full border border-ink px-4 py-1.5 text-sm font-medium">
				Cart
				{#if itemCount > 0}
					<span class="ml-1 rounded-full bg-marigold px-1.5 py-0.5 text-xs text-ink">{itemCount}</span>
				{/if}
			</a>
		</div>
	</header>

	<main class="flex-1">
		<slot />
	</main>

	<footer class="border-t border-line px-6 py-10 text-sm text-ink/70">
		<div class="mx-auto max-w-6xl">
			<p>Loka &mdash; curated finds, sourced honestly, delivered across India.</p>
		</div>
	</footer>
</div>
