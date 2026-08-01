<script lang="ts">
	import { Teleport, ZLayer } from "../portal";
	import { PopoverBond } from "./bond.svelte";
	import type { PopoverOverlayProps } from "./types";

    const bond = PopoverBond.getOrThrow('<Popover.Overlay /> must be used within a <Popover />');
    const isOpen = $derived(bond?.state.isOpen ?? false);

	const strategy = $derived(bond?.state.position?.strategy ?? 'absolute');

	// CSS position matching the strategy's coordinate basis (ADR 0008 D1).
	const positionStyle = $derived(strategy === 'fixed' ? 'position: fixed;' : 'position: absolute;');

    let { portal, layer: layerName = 'positioned', order = undefined, children = undefined, "z-index": zIndex = undefined, ...restProps}: PopoverOverlayProps = $props();

	// Stacking layer; captures parent elevation from context. `order` pins it relative
	// to a ZLayer anchor (ADR 0008 D3). Both fixed for the overlay's lifetime.
	// svelte-ignore state_referenced_locally
	const layer = new ZLayer(layerName, () => 0, undefined, order).share();

    const overlayProps = $derived({
        ...bond?.atom('overlay').spread,
        ...restProps
    });

	// Transform + opacity from the current floating-ui position.
	function calculatePosition() {
		const position = bond.state.position;

		if (!position) {
			return null;
		}

		const { placement, x = 0, y = 0, middlewareData } = position;

		// Anchor scrolled off-screen: hide and keep the last transform
		if (middlewareData?.hide?.referenceHidden) {
			return { opacity: '0' };
		}

		const offset = bond.state.props.offset;
		const openState = +isOpen;

		// Offset direction per placement
		const directionY = placement?.startsWith('top') ? -1 : placement?.startsWith('bottom') ? 1 : 0;
		const directionX = placement?.startsWith('left') ? -1 : placement?.startsWith('right') ? 1 : 0;

		// Arrow dimensions
        const arrow = bond.element('arrow');
		const arrowEl = arrow instanceof Element ? arrow : null;
		const arrowWidth = arrowEl?.clientWidth ?? 0;
		const arrowHeight = arrowEl?.clientHeight ?? 0;
		const arrowDelta = middlewareData?.arrow ? 1 : 0;

		// Apply offset and arrow adjustment to the base coordinates
		const finalX = x + directionX * offset * openState + arrowDelta * directionX * arrowWidth;
		const finalY = y + directionY * offset * openState + arrowDelta * directionY * arrowHeight;

		return {
			transform: `translate3d(${finalX}px, ${finalY}px, 1px)`,
			opacity: openState.toString()
		};
	}

	function initial(this: typeof bond.state, node: HTMLElement) {
		const styles = calculatePosition();

		// Hide until positioned to avoid ghosting
		if (!styles) {
			node.style.opacity = '0';
			return;
		}

		node.style.opacity = styles.opacity;
		// No transform when the anchor is hidden — keep the last position
		if (styles.transform) node.style.transform = styles.transform;
	}

	function animate(this: typeof bond.state, node: HTMLElement) {
		void bond.state.props.open; // track open state for reactivity

		const styles = calculatePosition();

		if (!styles) {
			return;
		}

		node.style.opacity = styles.opacity;
		// No transform when the anchor is hidden — keep the last position
		if (styles.transform) node.style.transform = styles.transform;
	}
</script>

<Teleport
	{portal}
	as="div"
	class="top-0 left-0 h-min w-fit outline-none pointer-events-none"
	style="z-index: {zIndex?? layer.value}; {positionStyle}"
	initial={initial}
	animate={animate}
	{...overlayProps}
>
	{@render children?.({ popover: bond })}
</Teleport>