<script lang="ts">
	let { size = 48, class: className = 'text-white' } = $props();

	// Calculate dimensions
	const outerRadius = $derived(size * 0.45);
	const triangleRadius = $derived(size * 0.22); // Slightly smaller for better balance
	const smallTriangleSize = $derived(size * 0.06); // Size of small outer triangles

	// Create dash array for outer circle with 3 equal dashes
	// Circle circumference = 2 * π * r
	const circumference = $derived(2 * Math.PI * outerRadius);
	const dashLength = $derived(circumference / 6); // 3 dashes + 3 gaps = 6 segments
	const dashArray = $derived(`${dashLength} ${dashLength}`);

	// Calculate triangle points (equilateral, pointing up)
	const center = $derived(size / 2);
	const angleOffset = -Math.PI / 2; // Start at top (pointing up)

	const trianglePoints = $derived(
		[0, 120, 240].map((angle) => {
			const rad = (angle * Math.PI) / 180 + angleOffset;
			return {
				x: center + triangleRadius * Math.cos(rad),
				y: center + triangleRadius * Math.sin(rad)
			};
		})
	);

	// Create triangle path with subtle curved edges using quadratic bezier curves
	const roundness = 0.15; // Control how rounded the corners are (0 = sharp, 1 = very round)
	const trianglePath = $derived(
		trianglePoints
			.map((p, i) => {
				const nextP = trianglePoints[(i + 1) % 3]!;
				// Calculate control point between vertices for subtle rounding
				const controlX = p.x + (nextP.x - p.x) * roundness;
				const controlY = p.y + (nextP.y - p.y) * roundness;
				const endX = p.x + (nextP.x - p.x) * (1 - roundness);
				const endY = p.y + (nextP.y - p.y) * (1 - roundness);

				if (i === 0) {
					return `M${controlX},${controlY} L${endX},${endY}`;
				}
				return `Q${p.x},${p.y} ${controlX},${controlY} L${endX},${endY}`;
			})
			.join(' ') +
			` Q${trianglePoints[0]!.x},${trianglePoints[0]!.y} ${trianglePoints[0]!.x + (trianglePoints[1]!.x - trianglePoints[0]!.x) * roundness},${trianglePoints[0]!.y + (trianglePoints[1]!.y - trianglePoints[0]!.y) * roundness} Z`
	);

	// Calculate small triangles in the gaps (pointing outward)
	const smallTriangles = $derived(
		[0, 120, 240].map((angle) => {
			const rad = (angle * Math.PI) / 180 + angleOffset;
			const tipDistance = outerRadius + smallTriangleSize * 0.3;
			const baseDistance = outerRadius - smallTriangleSize * 0.5;

			// Tip of small triangle (pointing outward)
			const tipX = center + tipDistance * Math.cos(rad);
			const tipY = center + tipDistance * Math.sin(rad);

			// Base corners (perpendicular to radius)
			const baseAngle1 = rad + Math.PI / 2;
			const baseAngle2 = rad - Math.PI / 2;
			const baseOffset = smallTriangleSize * 0.4;

			return {
				path: `M${tipX},${tipY} L${center + baseDistance * Math.cos(rad) + baseOffset * Math.cos(baseAngle1)},${center + baseDistance * Math.sin(rad) + baseOffset * Math.sin(baseAngle1)} L${center + baseDistance * Math.cos(rad) + baseOffset * Math.cos(baseAngle2)},${center + baseDistance * Math.sin(rad) + baseOffset * Math.sin(baseAngle2)} Z`
			};
		})
	);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 {size} {size}"
	class="atomic-logo {className}"
	role="img"
	aria-label="Atomic SV Logo - triangle as the fundamental building block"
>
	<!-- Outer dashed circle with 3 dashes - gaps align with triangle vertices -->
	<circle
		cx={size / 2}
		cy={size / 2}
		r={outerRadius}
		fill="none"
		stroke="currentColor"
		stroke-width={size * 0.05}
		stroke-dasharray={dashArray}
		stroke-linecap="round"
		class="opacity-70"
		transform="rotate(-90 {size / 2} {size / 2})"
	/>

	<!-- Small triangles in the gaps - reinforcing the building block concept -->
	{#each smallTriangles as triangle, i (i)}
		<path d={triangle.path} fill="currentColor" class="opacity-60" />
	{/each}

	<!-- Core triangle - the fundamental building block -->
	<path
		d={trianglePath}
		fill="currentColor"
		stroke="currentColor"
		stroke-width={size * 0.02}
		stroke-linejoin="round"
	/>
</svg>
