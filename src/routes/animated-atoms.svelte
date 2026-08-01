<script lang="ts">
	import { resizeObserver } from '$lib/attachments/resize-observer.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { debounce } from 'es-toolkit';
	import { animate } from 'animejs';

	let animationFrame: number = $state(0);

	let isShowAtoms = $state(false);

	interface Atom {
		id: number;
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number;
		opacity: number;
	}

	interface Connection {
		atom1: Atom;
		atom2: Atom;
		opacity: number;
		distance: number;
	}

	interface OuterCircle {
		id: number;
		x: number;
		y: number;
		radius: number;
	}

	interface CircleConnection {
		atom: Atom;
		circle: OuterCircle;
		opacity: number;
		distance: number;
	}

	let atoms: Atom[] = $state([]);
	let connections: Connection[] = $state([]);
	let outerCircles: OuterCircle[] = $state([]);
	let circleConnections: CircleConnection[] = $state([]);
	let clientWidth = $state(0);
	let clientHeight = $state(0);

	const ATOM_COUNT = 66;
	const MAX_CONNECTION_DISTANCE = 150;
	const ATOM_SPEED = 0.3;
	const CONNECTION_FADE_SPEED = 0.02;

	// Central deflection area
	let centerX = $state(0);
	let centerY = $state(0);

	const DEFLECTION_RADIUS = $derived(clientHeight * 0.4);
	const DEFLECTION_STRENGTH = 0.005;

	// Rotation for outer circles
	let rotationAngle = $state(0);

	// Outer circles
	const OUTER_CIRCLE_COUNT = 6;
	const OUTER_CIRCLE_RADIUS = 32;
	const OUTER_CIRCLE_DISTANCE = $derived(DEFLECTION_RADIUS);
	const MAX_CIRCLE_CONNECTION_DISTANCE = 80;
	const ROTATION_SPEED = 0.001;

	// Circular text
	const TEXT_RADIUS = $derived(DEFLECTION_RADIUS * 0.8);

	const showAtoms = debounce(() => {
		if (!atoms.length) {
			createAtoms();
		} else {
			updateAtoms();
		}

		createOuterCircles();

		isShowAtoms = true;
	}, 1000);

	function createAtoms() {
		atoms = [];
		const edgeZone = 80; // Width of edge zone

		for (let i = 0; i < ATOM_COUNT; i++) {
			let x, y;

			// Randomly choose which edge zone to place atom in
			const zone = Math.floor(Math.random() * 4);

			if (zone === 0) {
				// Top edge zone
				x = Math.random() * clientWidth;
				y = Math.random() * edgeZone;
			} else if (zone === 1) {
				// Right edge zone
				x = clientWidth - Math.random() * edgeZone;
				y = Math.random() * clientHeight;
			} else if (zone === 2) {
				// Bottom edge zone
				x = Math.random() * clientWidth;
				y = clientHeight - Math.random() * edgeZone;
			} else {
				// Left edge zone
				x = Math.random() * edgeZone;
				y = Math.random() * clientHeight;
			}

			atoms.push({
				id: i,
				x,
				y,
				vx: (Math.random() - 0.5) * ATOM_SPEED,
				vy: (Math.random() - 0.5) * ATOM_SPEED,
				radius: Math.random() * 10 + 1,
				opacity: Math.random() * 0.4 + 0.2
			});
		}
	}

	function createOuterCircles() {
		outerCircles = [];
		for (let i = 0; i < OUTER_CIRCLE_COUNT; i++) {
			outerCircles.push({
				id: i,
				x: 0,
				y: 0,
				radius: OUTER_CIRCLE_RADIUS
			});
		}
		updateOuterCircles();
	}

	function updateOuterCircles() {
		for (let i = 0; i < outerCircles.length; i++) {
			const circle = outerCircles[i];
			if (!circle) continue;
			const angle = (i / OUTER_CIRCLE_COUNT) * 2 * Math.PI + rotationAngle;
			circle.x = centerX + Math.cos(angle) * OUTER_CIRCLE_DISTANCE;
			circle.y = centerY + Math.sin(angle) * OUTER_CIRCLE_DISTANCE;
		}
	}

	function updateAtoms() {
		if (!isShowAtoms) return;

		for (let i = 0; i < atoms.length; i++) {
			const atom = atoms[i];
			if (!atom) continue;

			// Check if atom is in the central deflection area
			const distanceToCenter = Math.sqrt(
				Math.pow(atom.x - centerX, 2) + Math.pow(atom.y - centerY, 2)
			);

			if (distanceToCenter < DEFLECTION_RADIUS) {
				// Calculate deflection force away from center
				const forceX = (atom.x - centerX) / distanceToCenter;
				const forceY = (atom.y - centerY) / distanceToCenter;

				// Apply deflection force
				atom.vx += forceX * DEFLECTION_STRENGTH;
				atom.vy += forceY * DEFLECTION_STRENGTH;

				// Limit velocity to prevent atoms from moving too fast
				const maxSpeed = ATOM_SPEED * 2;
				const currentSpeed = Math.sqrt(atom.vx * atom.vx + atom.vy * atom.vy);
				if (currentSpeed > maxSpeed) {
					atom.vx = (atom.vx / currentSpeed) * maxSpeed;
					atom.vy = (atom.vy / currentSpeed) * maxSpeed;
				}
			}

			atom.x += atom.vx;
			atom.y += atom.vy;

			// Bounce off edges
			if (atom.x <= atom.radius || atom.x >= clientWidth - atom.radius) {
				atom.vx *= -1;
				atom.x = Math.max(atom.radius, Math.min(clientWidth - atom.radius, atom.x));
			}
			if (atom.y <= atom.radius || atom.y >= clientHeight - atom.radius) {
				atom.vy *= -1;
				atom.y = Math.max(atom.radius, Math.min(clientHeight - atom.radius, atom.y));
			}
		}
	}

	function updateConnections() {
		const newConnections: Connection[] = [];

		for (let i = 0; i < atoms.length; i++) {
			for (let j = i + 1; j < atoms.length; j++) {
				const atom1 = atoms[i];
				const atom2 = atoms[j];
				if (!atom1 || !atom2) continue;
				const distance = Math.sqrt(Math.pow(atom1.x - atom2.x, 2) + Math.pow(atom1.y - atom2.y, 2));

				if (distance < MAX_CONNECTION_DISTANCE) {
					const existingConnection = connections.find(
						(c) =>
							(c.atom1.id === atom1.id && c.atom2.id === atom2.id) ||
							(c.atom1.id === atom2.id && c.atom2.id === atom1.id)
					);

					const targetOpacity = (1 - distance / MAX_CONNECTION_DISTANCE) * 0.4;
					let currentOpacity = existingConnection ? existingConnection.opacity : 0;

					// Fade in/out animation
					if (currentOpacity < targetOpacity) {
						currentOpacity = Math.min(targetOpacity, currentOpacity + CONNECTION_FADE_SPEED);
					} else if (currentOpacity > targetOpacity) {
						currentOpacity = Math.max(targetOpacity, currentOpacity - CONNECTION_FADE_SPEED);
					}

					if (currentOpacity > 0.01) {
						newConnections.push({
							atom1,
							atom2,
							opacity: currentOpacity,
							distance
						});
					}
				}
			}
		}

		connections = newConnections;
	}

	function updateCircleConnections() {
		const newCircleConnections: CircleConnection[] = [];

		for (const atom of atoms) {
			for (const circle of outerCircles) {
				const distance = Math.sqrt(Math.pow(atom.x - circle.x, 2) + Math.pow(atom.y - circle.y, 2));

				if (distance < MAX_CIRCLE_CONNECTION_DISTANCE) {
					const existingConnection = circleConnections.find(
						(c) => c.atom.id === atom.id && c.circle.id === circle.id
					);

					const targetOpacity = (1 - distance / MAX_CIRCLE_CONNECTION_DISTANCE) * 0.6;
					let currentOpacity = existingConnection ? existingConnection.opacity : 0;

					// Fade in/out animation
					if (currentOpacity < targetOpacity) {
						currentOpacity = Math.min(targetOpacity, currentOpacity + CONNECTION_FADE_SPEED);
					} else if (currentOpacity > targetOpacity) {
						currentOpacity = Math.max(targetOpacity, currentOpacity - CONNECTION_FADE_SPEED);
					}

					if (currentOpacity > 0.01) {
						newCircleConnections.push({
							atom,
							circle,
							opacity: currentOpacity,
							distance
						});
					}
				}
			}
		}

		circleConnections = newCircleConnections;
	}

	function _animate() {
		rotationAngle += ROTATION_SPEED;
		updateOuterCircles();
		updateAtoms();
		updateConnections();
		updateCircleConnections();
		animationFrame = requestAnimationFrame(_animate);
	}

	onMount(() => {
		_animate();

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});
</script>

<svg
	class="absolute inset-0 z-0 h-full w-full overflow-visible"
	viewBox="0 0 {clientWidth} {clientHeight}"
	preserveAspectRatio="xMidYMid slice"
	{@attach (node: HTMLElement) =>
		resizeObserver(() => {
			isShowAtoms = false;
			clientWidth = node.clientWidth;
			clientHeight = node.clientHeight;

			centerX = clientWidth / 2;
			centerY = clientHeight / 2;

			showAtoms.cancel();
			showAtoms();
		})(node)}
>
	<defs>
		<path
			id="textCircle"
			d="M {centerX} {centerY - TEXT_RADIUS}
			   A {TEXT_RADIUS} {TEXT_RADIUS} 0 1 1 {centerX - 0.1} {centerY - TEXT_RADIUS}"
		/>
	</defs>

	<!-- Central deflection area (subtle visual indicator) -->
	{#if centerX && centerY}
		<g transform="translate({centerX} {centerY})">
			<circle
				r={DEFLECTION_RADIUS}
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-opacity="0.2"
				class="text-accent animate-pulse"
				stroke-dasharray="80,100,20,50"
				{@attach (node: SVGCircleElement) => {
					const animation = animate(node, {
						rotate: 180,
						duration: 50000,
						easing: 'linear',
						reversed: true,
						loop: true
					});

					return () => {
						animation.cancel();
					};
				}}
			/>
		</g>
	{/if}

	<!-- Outer circles -->
	{#each outerCircles as circle (circle.id)}
		<g class="text-palette-ion">
			<circle
				cx={circle.x}
				cy={circle.y}
				r={circle.radius}
				fill="currentColor"
				fill-opacity="0.1"
				class="animate-pulse"
			/>
			<circle
				cx={circle.x}
				cy={circle.y}
				r={circle.radius * 0.3}
				fill="currentColor"
				fill-opacity="1"
				class="animate-pulse"
			/>
		</g>
	{/each}

	<!-- Circle connections -->
	{#each circleConnections as connection, i (i)}
		<line
			x1={connection.atom.x}
			y1={connection.atom.y}
			x2={connection.circle.x}
			y2={connection.circle.y}
			stroke="currentColor"
			stroke-width="1"
			opacity={connection.opacity}
			class="animate-pulse text-palette-atomic/10"
			in:fade={{ duration: 800 }}
			out:fade={{ duration: 100 }}
		/>
	{/each}

	<!-- Connections -->
	{#each connections as connection, i (i)}
		<line
			x1={connection.atom1.x}
			y1={connection.atom1.y}
			x2={connection.atom2.x}
			y2={connection.atom2.y}
			stroke="currentColor"
			stroke-width="1"
			opacity={connection.opacity}
			class="animate-pulse text-palette-photon/10"
			in:fade={{ duration: 1000 }}
			out:fade={{ duration: 100 }}
		/>
	{/each}

	<!-- Atoms -->
	{#each atoms as atom (atom.id)}
		<g fill="currentColor">
			<circle
				cx={atom.x}
				cy={atom.y}
				r={atom.radius}
				opacity={atom.opacity}
				class="animate-pulse text-palette-energy/80"
			/>
			<!-- Atom glow effect -->
			<circle
				cx={atom.x}
				cy={atom.y}
				r={atom.radius * 1.5}
				opacity={atom.opacity * 0.3}
				class="animate-pulse text-palette-energy/20"
			/>
		</g>
	{/each}
</svg>

<style>
	svg {
		filter: blur(0.5px);
	}

	.animate-pulse {
		animation: atom-pulse 3s ease-in-out infinite;
	}

	@keyframes atom-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
