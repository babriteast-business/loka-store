<script lang="ts">
	import { T, useFrame } from '@threlte/core';
	import CategoryShape from './CategoryShape.svelte';
	import { categories } from '$lib/categories';

	let groupRotation = 0;
	useFrame((_, delta) => {
		groupRotation += delta * 0.12;
	});

	const radius = 3.4;
</script>

<T.PerspectiveCamera makeDefault position={[0, 1.4, 9]} fov={38} />

<T.AmbientLight intensity={0.55} />
<T.DirectionalLight position={[5, 6, 4]} intensity={1.2} />
<T.PointLight position={[-4, -2, -3]} intensity={0.4} color="#E7A93C" />

<T.Group rotation.y={groupRotation}>
	{#each categories as category, i (category.slug)}
		{@const angle = (i / categories.length) * Math.PI * 2}
		<T.Group position={[Math.sin(angle) * radius, Math.sin(angle * 1.3) * 0.5, Math.cos(angle) * radius]}>
			<CategoryShape {category} counterRotation={-groupRotation} />
		</T.Group>
	{/each}
</T.Group>
