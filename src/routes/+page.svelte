<script lang="ts">
	import Hero3D from '$lib/components/Hero3D.svelte';
	import { categories } from '$lib/categories';
	import { tilt } from '$lib/actions/tilt';
</script>

<svelte:head>
	<title>Loka — curated finds, honestly priced</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-6 pt-12">
	<div class="max-w-xl">
		<h1 class="font-display text-5xl leading-[1.05] sm:text-6xl">
			Good stuff,<br />without the markup.
		</h1>
		<p class="mt-5 text-lg text-ink/75">
			Five categories, one shelf of things worth owning. Spin the shapes below or pick a
			category to start browsing.
		</p>
	</div>
</section>

<Hero3D />

<section class="mx-auto max-w-6xl px-6 py-16">
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
		{#each categories as category (category.slug)}
			<a
				href="/category/{category.slug}"
				use:tilt={6}
				class="group flex flex-col gap-2 rounded-2xl border border-line bg-paper p-5 shadow-sm transition-colors hover:border-ink"
			>
				<span
					class="h-2 w-8 rounded-full"
					style="background: {category.color}"
				/>
				<span class="font-display text-lg">{category.name}</span>
				<span class="text-sm text-ink/60">{category.tagline}</span>
			</a>
		{/each}
	</div>
</section>
