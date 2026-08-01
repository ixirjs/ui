<script lang="ts">
	import { PortalSurface } from '$ixirjs/ui/components/portal';
	import { createPopoverAtom, getPopoverPosition, PopoverBond, popoverNode } from './bond.svelte';
	import { createAtomInstance, type Atom } from '$ixirjs/ui/shared/bond';
	import { overlayIsOpen } from '$ixirjs/ui/components/overlay/policies/overlay-view';
	import type { PopoverOverlayProps } from './types';
	import type { PresetLike } from '$ixirjs/ui/preset';

	const bond = PopoverBond.getOrThrow('<Popover.Overlay /> must be used within a <Popover />');
	const isOpen = $derived(overlayIsOpen(bond));

	const strategy = $derived(getPopoverPosition(bond)?.strategy ?? 'absolute');

	// CSS position and transform matching the strategy's coordinate basis. Keeping the computed
	// transform in the reactive presentation layer makes the surface update when floating-ui
	// publishes its first position after PortalSurface attaches the node.

	let {
		portal,
		layer: layerName = 'positioned',
		order = undefined,
		children = undefined,
		'z-index': zIndex = undefined,
		...restProps
	}: PopoverOverlayProps = $props();

	const overlayAtom = createAtomInstance<Atom<PopoverBond, HTMLElement>, PopoverBond, HTMLElement>(
		'overlay',
		{
			bond,
			factory: (owner) => createPopoverAtom(owner as PopoverBond, 'overlay')
		}
	);

	const overlayProps = $derived.by((): Record<string, unknown> => {
		const { style: _style, ...props } = {
			...(overlayAtom.spread as Record<string, unknown>),
			...restProps
		};
		return props as Record<string, unknown>;
	});
	const overlayPresetLayer = $derived(
		bond.presetLayer('overlay') ?? (overlayProps.presetLayer as PresetLike | undefined)
	);

	// Transform + opacity from the current floating-ui position.
	function calculatePosition() {
		const position = getPopoverPosition(bond);

		if (!position) {
			return null;
		}

		const { placement, x = 0, y = 0, middlewareData } = position;

		// Hide only when the reference has crossed the resolved boundary. Floating UI reports an
		// edge-touching reference as hidden too, but a zero offset still represents a visible anchor.
		const hiddenOffsets = middlewareData?.hide?.referenceHiddenOffsets;
		const referenceOutside =
			middlewareData?.hide?.referenceHidden &&
			hiddenOffsets &&
			Object.values(hiddenOffsets).some((offset) => offset > 0);
		if (referenceOutside) return { opacity: '0' };

		const offset = bond.props.offset;
		const openState = +isOpen;

		// Offset direction per placement
		const directionY = placement?.startsWith('top') ? -1 : placement?.startsWith('bottom') ? 1 : 0;
		const directionX = placement?.startsWith('left') ? -1 : placement?.startsWith('right') ? 1 : 0;

		// Tail dimensions. The default tail overlaps the content by a small square cap, so
		// only the protruding depth should push the floating overlay away from the trigger.
		const tail = popoverNode(bond, 'tail')?.element;
		const tailEl = tail instanceof HTMLElement ? tail : null;
		const tailOverlap = Number(tailEl?.dataset.tailOverlap ?? 0) || 0;
		const tailWidth = Math.max(0, (tailEl?.clientWidth ?? 0) - (directionX ? tailOverlap : 0));
		const tailHeight = Math.max(0, (tailEl?.clientHeight ?? 0) - (directionY ? tailOverlap : 0));
		// `middlewareData.arrow` is floating-ui's own `arrow()` middleware output — not our naming.
		const tailDelta = middlewareData?.arrow ? 1 : 0;

		// Apply offset and tail adjustment to the base coordinates
		const finalX = x + directionX * offset * openState + tailDelta * directionX * tailWidth;
		const finalY = y + directionY * offset * openState + tailDelta * directionY * tailHeight;

		return {
			transform: `translate3d(${finalX}px, ${finalY}px, 1px)`,
			opacity: openState.toString()
		};
	}

	const surfaceStyle = $derived.by(() => {
		const position = calculatePosition();
		return [
			strategy === 'fixed' ? 'position: fixed' : 'position: absolute',
			position?.transform && `transform: ${position.transform}`,
			`opacity: ${position?.opacity ?? '0'}`
		]
			.filter(Boolean)
			.join('; ');
	});
</script>

<PortalSurface
	owner={bond}
	band={layerName}
	{order}
	{portal}
	as="div"
	class="top-0 left-0 h-min w-fit outline-none pointer-events-none"
	style={surfaceStyle}
	z-index={zIndex}
	{...overlayProps}
	presetLayer={overlayPresetLayer}
>
	{@render children?.({ popover: bond })}
</PortalSurface>
