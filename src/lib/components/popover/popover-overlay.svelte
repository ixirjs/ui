<script lang="ts">
	import { Teleport, ZLayer } from '../portal';
	import {
		createPopoverAtom,
		getPopoverPosition,
		PopoverBond,
		PopoverOverlayAtom,
		popoverNode
	} from './bond.svelte';
	import { createAtomInstance, type Atom } from '$svelte-atoms/core/shared/bond';
	import { overlayIsOpen } from '$svelte-atoms/core/components/portal/host/policies/overlay-view';
	import type { PopoverOverlayProps } from './types';
	import { untrack } from 'svelte';

	const bond = PopoverBond.getOrThrow('<Popover.Overlay /> must be used within a <Popover />');
	const isOpen = $derived(overlayIsOpen(bond));

	const strategy = $derived(getPopoverPosition(bond)?.strategy ?? 'absolute');

	// CSS position matching the strategy's coordinate basis.
	const positionStyle = $derived(strategy === 'fixed' ? 'position: fixed;' : 'position: absolute;');

	let {
		portal,
		layer: layerName = 'positioned',
		order: _order = undefined,
		children = undefined,
		'z-index': zIndex = undefined,
		...restProps
	}: PopoverOverlayProps = $props();

	// Stacking layer; captures parent elevation from context. `order` pins it relative
	// to a ZLayer anchor. Both fixed for the overlay's lifetime.
	const parentLayer = ZLayer.tryGet();
	const layer = new ZLayer(
		untrack(() => layerName),
		() => 0
	).share();

	const z = $derived((parentLayer?.value ?? 0) + layer.value);

	const overlayAtom = createAtomInstance<Atom<PopoverBond, HTMLElement>, PopoverBond, HTMLElement>(
		'overlay',
		{
			bond,
			factory: (owner) =>
				createPopoverAtom(
					owner as PopoverBond,
					'overlay',
					(popover) => new PopoverOverlayAtom(popover)
				)
		}
	);

	const overlayProps = $derived({
		...(overlayAtom.spread as Record<string, unknown>),
		...restProps
	} as Record<string, unknown>);

	// Transform + opacity from the current floating-ui position.
	function calculatePosition() {
		const position = getPopoverPosition(bond);

		if (!position) {
			return null;
		}

		const { placement, x = 0, y = 0, middlewareData } = position;

		// Anchor scrolled off-screen: hide and keep the last transform
		if (middlewareData?.hide?.referenceHidden) {
			return { opacity: '0' };
		}

		const offset = bond.props.offset;
		const openState = +isOpen;

		// Offset direction per placement
		const directionY = placement?.startsWith('top') ? -1 : placement?.startsWith('bottom') ? 1 : 0;
		const directionX = placement?.startsWith('left') ? -1 : placement?.startsWith('right') ? 1 : 0;

		// Arrow dimensions
		const arrow = popoverNode(bond, 'arrow')?.element;
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

	function initial(node: HTMLElement) {
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

	function animate(node: HTMLElement) {
		void bond.props.open; // track open state for reactivity

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
	style="z-index: {typeof zIndex === 'function' ? zIndex(z) : (zIndex ?? z)}; {positionStyle}"
	{initial}
	{animate}
	{...overlayProps}
>
	{@render children?.({ popover: bond })}
</Teleport>
