<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
</script>

<!--
	3D hero: five procedurally-generated shapes (no external model files needed)
	orbit slowly around a center point, one per product category. Hovering
	lifts a shape and shows its label; clicking navigates to that category.
-->
<div class="relative h-[78vh] w-full">
	<Canvas>
		<Scene />
	</Canvas>
</div>
