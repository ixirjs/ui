<script lang="ts">
	import { Teleport, ZLayer } from "../portal";
	import { PopoverBond } from "./bond.svelte";
	import type { PopoverOverlayProps } from "./types";

    const bond = PopoverBond.get();
    const isOpen = $derived(bond?.state.isOpen ?? false);
    const positionStrategy = $derived(bond?.state.props.positionStrategy ?? 'absolute');

    const parentLayer = (() => {
		try {
			return ZLayer.get();
		} catch {
			return undefined;
		}
	})();

	const layer = new ZLayer('popover', () => parentLayer?.get() ?? 0).share();

    let { portal, children = undefined, ...restProps}: PopoverOverlayProps = $props();

    const overlayProps = $derived({
        ...bond?.atom('overlay').spread,
        ...restProps
    });

	// Computes final transform and opacity from the current floating-ui position.
	function calculatePosition() {
		const position = bond.state.position;

		if (!position) {
			return null;
		}

		const { placement, x = 0, y = 0, middlewareData } = position;
		const offset = bond.state.props.offset;
		const openState = +isOpen;

		// Calculate direction multipliers based on placement
		const directionY = placement?.startsWith('top') ? -1 : placement?.startsWith('bottom') ? 1 : 0;
		const directionX = placement?.startsWith('left') ? -1 : placement?.startsWith('right') ? 1 : 0;

        const arrow = bond.element('arrow');
		// Calculate arrow dimensions and delta
		const arrowWidth = arrow?.clientWidth ?? 0;
		const arrowHeight = arrow?.clientHeight ?? 0;
		const arrowDelta = middlewareData?.arrow ? 1 : 0;

		// Calculate final position with offset and arrow adjustment
		const finalX = x + directionX * offset * openState + arrowDelta * directionX * arrowWidth;
		const finalY = y + directionY * offset * openState + arrowDelta * directionY * arrowHeight;

		return {
			transform: `translate3d(${finalX}px, ${finalY}px, 1px)`,
			opacity: openState.toString()
		};
	}

	function initial(this: typeof bond.state, node: HTMLElement) {
		const styles = calculatePosition();

		// Hide content until position is calculated to avoid ghosting
		if (!styles) {
			node.style.opacity = '0';
			return;
		}

		node.style.transform = styles.transform;
		node.style.opacity = styles.opacity;
	}

	function animate(this: typeof bond.state, node: HTMLElement) {
		void bond.state.props.open; // Ensure reactivity to open state changes

		const styles = calculatePosition();

		if (!styles) {
			return;
		}

		node.style.transform = styles.transform;
		node.style.opacity = '1';
	}
</script>

<Teleport
	{portal}
	as="div"
	class="top-0 left-0 h-min w-fit outline-none pointer-events-none"
	style="z-index: {layer.get()}; position: {positionStrategy};"
	initial={initial}
	animate={animate}
	{...overlayProps}
>
	{@render children?.({ popover: bond })}
</Teleport>