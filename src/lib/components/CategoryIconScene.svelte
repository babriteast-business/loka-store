<script lang="ts">
	import { T, useFrame } from '@threlte/core';
	import type { Category } from '$lib/categories';

	export let category: Category;

	let spin = 0;
	useFrame((_, delta) => {
		spin += delta * 0.6;
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 3.2]} fov={40} />
<T.AmbientLight intensity={0.6} />
<T.DirectionalLight position={[2, 3, 2]} intensity={1.1} />

{#if category.shape === 'torusKnot'}
	<T.Mesh rotation.x={spin} rotation.y={spin * 0.6}>
		<T.TorusKnotGeometry args={[0.55, 0.18, 96, 12]} />
		<T.MeshStandardMaterial color={category.color} roughness={0.35} metalness={0.15} />
	</T.Mesh>
{:else if category.shape === 'icosahedron'}
	<T.Mesh rotation.x={spin} rotation.y={spin}>
		<T.IcosahedronGeometry args={[0.72, 0]} />
		<T.MeshStandardMaterial color={category.color} roughness={0.3} metalness={0.2} flatShading />
	</T.Mesh>
{:else if category.shape === 'octahedron'}
	<T.Mesh rotation.y={spin}>
		<T.OctahedronGeometry args={[0.78, 0]} />
		<T.MeshStandardMaterial color={category.color} roughness={0.4} metalness={0.1} flatShading />
	</T.Mesh>
{:else if category.shape === 'dodecahedron'}
	<T.Mesh rotation.y={spin} rotation.x={spin * 0.4}>
		<T.DodecahedronGeometry args={[0.7, 0]} />
		<T.MeshStandardMaterial color={category.color} roughness={0.3} metalness={0.25} flatShading />
	</T.Mesh>
{:else if category.shape === 'capsule'}
	<T.Mesh rotation.z={Math.PI / 2} rotation.y={spin}>
		<T.CapsuleGeometry args={[0.4, 0.7, 8, 16]} />
		<T.MeshStandardMaterial color={category.color} roughness={0.35} metalness={0.15} />
	</T.Mesh>
{/if}
