<script lang="ts">
	import { Canvas } from '@threlte/core';
	import CategoryIconScene from './CategoryIconScene.svelte';
	import type { Category } from '$lib/categories';

	export let category: Category;
	export let size = 96;
</script>

<div style="width: {size}px; height: {size}px" class="shrink-0">
	<Canvas>
		<CategoryIconScene {category} />
	</Canvas>
</div>
