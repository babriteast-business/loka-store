<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	// Group the catalog by category so it's obvious at a glance where gaps are —
	// e.g. "Kids Section has 0 products" is easy to miss in one long flat list.
	$: grouped = data.categories?.map((c) => ({
		...c,
		products: data.products.filter((p) => p.category === c.slug)
	}));
</script>

<svelte:head>
	<title>Admin — Loka</title>
</svelte:head>

<section class="mx-auto max-w-4xl px-6 py-12">
	{#if !data.authed}
		<h1 class="font-display text-2xl">Admin login</h1>
		<form method="POST" action="?/login" use:enhance class="mt-6 max-w-sm space-y-3">
			<input
				type="password"
				name="password"
				placeholder="Admin password"
				class="w-full rounded-lg border border-line px-4 py-3"
			/>
			<button class="w-full rounded-full bg-ink py-3 font-medium text-paper">Log in</button>
			{#if form?.message}
				<p class="text-sm text-rust">{form.message}</p>
			{/if}
		</form>
	{:else}
		<div class="flex items-center justify-between">
			<h1 class="font-display text-2xl">Products ({data.products.length})</h1>
			<div class="flex items-center gap-4">
				<a href="/admin/orders" class="text-sm text-teal underline">Orders & Shipments</a>
				<form method="POST" action="?/logout" use:enhance>
					<button class="text-sm text-ink/50 underline">Log out</button>
				</form>
			</div>
		</div>

		<h2 class="mt-10 font-display text-lg">Add a product</h2>
		<form method="POST" action="?/addProduct" use:enhance class="mt-4 grid gap-3 sm:grid-cols-2">
			<input name="name" placeholder="Product name" required class="rounded-lg border border-line px-3 py-2" />

			<div>
				<label for="category" class="mb-1 block text-xs font-medium text-ink/50">Category</label>
				<select id="category" name="category" required class="w-full rounded-lg border border-line px-3 py-2">
					{#each data.categories as c}
						<option value={c.slug}>{c.name}</option>
					{/each}
				</select>
			</div>

			<input
				name="price_inr"
				type="number"
				placeholder="Price (₹)"
				required
				class="rounded-lg border border-line px-3 py-2"
			/>
			<input
				name="compare_at_inr"
				type="number"
				placeholder="Compare-at price (optional, shows a strike-through + % off)"
				class="rounded-lg border border-line px-3 py-2"
			/>
			<input
				name="stock"
				type="number"
				placeholder="Stock quantity"
				required
				class="rounded-lg border border-line px-3 py-2"
			/>
			<input
				name="image_url"
				placeholder="Image URL"
				required
				class="rounded-lg border border-line px-3 py-2"
			/>
			<input
				name="source_note"
				placeholder="Supplier note (e.g. AliExpress link) — for your eyes only"
				class="rounded-lg border border-line px-3 py-2 sm:col-span-2"
			/>
			<textarea
				name="description"
				placeholder="Description"
				rows="2"
				class="rounded-lg border border-line px-3 py-2 sm:col-span-2"
			/>
			<label class="flex items-center gap-2 text-sm sm:col-span-2">
				<input type="checkbox" name="bestseller" class="h-4 w-4" />
				Mark as bestseller (shows a badge and sorts it first in its category)
			</label>
			<button class="rounded-full bg-ink py-2.5 font-medium text-paper sm:col-span-2">
				Add product
			</button>
			{#if form?.message}
				<p class="text-sm text-rust sm:col-span-2">{form.message}</p>
			{/if}
		</form>

		<h2 class="mt-12 font-display text-lg">Catalog by category</h2>
		{#each grouped as group (group.slug)}
			<div class="mt-6">
				<div class="flex items-center gap-2 border-b border-line pb-2">
					<span class="h-2.5 w-2.5 rounded-full" style="background: {group.color}" />
					<h3 class="font-medium">{group.name}</h3>
					<span class="text-sm text-ink/40">({group.products.length})</span>
				</div>
				{#if group.products.length === 0}
					<p class="py-3 text-sm text-ink/40">No products yet — add one above and pick this category.</p>
				{:else}
					<div class="divide-y divide-line">
						{#each group.products as p (p.id)}
							<div class="flex items-center gap-4 py-3">
								<img src={p.image_url} alt="" class="h-12 w-12 rounded object-cover" />
								<div class="flex-1">
									<p class="font-medium">
										{p.name}
										{#if p.bestseller}
											<span class="ml-1 rounded-full bg-marigold px-2 py-0.5 text-xs text-ink">Bestseller</span>
										{/if}
									</p>
									<p class="text-sm text-ink/50">₹{p.price_inr} · {p.stock} in stock · {p.units_sold ?? 0} sold</p>
								</div>
								<form method="POST" action="?/toggleBestseller" use:enhance>
									<input type="hidden" name="id" value={p.id} />
									<input type="hidden" name="current" value={p.bestseller} />
									<button class="text-sm text-teal underline">
										{p.bestseller ? 'Unmark' : 'Mark bestseller'}
									</button>
								</form>
								<form method="POST" action="?/deleteProduct" use:enhance>
									<input type="hidden" name="id" value={p.id} />
									<button class="text-sm text-ink/40 hover:text-rust">Delete</button>
								</form>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</section>
