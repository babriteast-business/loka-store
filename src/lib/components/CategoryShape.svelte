<script lang="ts">
	import { T, useFrame } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/categories';

	export let category: Category;
	export let counterRotation = 0;

	let hovered = false;
	let spin = 0;
	let lift = 0;

	useFrame((_, delta) => {
		spin += delta * (hovered ? 1.4 : 0.5);
		lift += (hovered ? 1 : 0 - lift) * delta * 4;
	});

	function navigate() {
		goto(`/category/${category.slug}`);
	}
</script>

<!-- counter-rotate so labels always face the camera regardless of group spin -->
<T.Group rotation.y={counterRotation}>
	<T.Group
		position.y={hovered ? 0.35 : 0}
		on:pointerenter={() => (hovered = true)}
		on:pointerleave={() => (hovered = false)}
		on:click={navigate}
	>
		{#if category.shape === 'torusKnot'}
			<T.Mesh rotation.x={spin} rotation.y={spin * 0.6} scale={hovered ? 1.12 : 1}>
				<T.TorusKnotGeometry args={[0.55, 0.18, 128, 16]} />
				<T.MeshStandardMaterial color={category.color} roughness={0.35} metalness={0.15} />
			</T.Mesh>
		{:else if category.shape === 'icosahedron'}
			<T.Mesh rotation.x={spin} rotation.y={spin} scale={hovered ? 1.12 : 1}>
				<T.IcosahedronGeometry args={[0.72, 0]} />
				<T.MeshStandardMaterial color={category.color} roughness={0.3} metalness={0.2} flatShading />
			</T.Mesh>
		{:else if category.shape === 'octahedron'}
			<T.Mesh rotation.y={spin} scale={hovered ? 1.12 : 1}>
				<T.OctahedronGeometry args={[0.78, 0]} />
				<T.MeshStandardMaterial color={category.color} roughness={0.4} metalness={0.1} flatShading />
			</T.Mesh>
		{:else if category.shape === 'dodecahedron'}
			<T.Mesh rotation.y={spin} rotation.x={spin * 0.4} scale={hovered ? 1.12 : 1}>
				<T.DodecahedronGeometry args={[0.7, 0]} />
				<T.MeshStandardMaterial color={category.color} roughness={0.3} metalness={0.25} flatShading />
			</T.Mesh>
		{:else if category.shape === 'capsule'}
			<T.Mesh rotation.z={Math.PI / 2} rotation.y={spin} scale={hovered ? 1.12 : 1}>
				<T.CapsuleGeometry args={[0.4, 0.7, 8, 16]} />
				<T.MeshStandardMaterial color={category.color} roughness={0.35} metalness={0.15} />
			</T.Mesh>
		{/if}

		<HTML position.y={-1.15} center pointerEvents="none">
			<div
				class="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium tracking-wide text-paper transition-opacity"
				style="background: {category.color}; opacity: {hovered ? 1 : 0.85}"
			>
				{category.name}
			</div>
		</HTML>
	</T.Group>
</T.Group>
