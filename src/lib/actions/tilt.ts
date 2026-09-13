// Lightweight 3D tilt: rotates an element toward the cursor using CSS transforms.
// No WebGL, no extra render cost — this is what gives flat product cards a
// "3D object" feel throughout the site without the performance hit of a
// real 3D scene per card.
export function tilt(node: HTMLElement, maxDeg = 8) {
	let frame: number;

	function onMove(e: PointerEvent) {
		const rect = node.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width - 0.5;
		const py = (e.clientY - rect.top) / rect.height - 0.5;

		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			node.style.transform = `perspective(700px) rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
		});
	}

	function onLeave() {
		cancelAnimationFrame(frame);
		node.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
	}

	node.style.transition = 'transform 0.15s ease-out';
	node.style.willChange = 'transform';
	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);

	return {
		update(newMaxDeg: number) {
			maxDeg = newMaxDeg;
		},
		destroy() {
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			cancelAnimationFrame(frame);
		}
	};
}
