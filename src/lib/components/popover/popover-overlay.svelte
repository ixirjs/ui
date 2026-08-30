<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { PortalSurface } from '$ixirjs/ui/components/portal';
	import { surfaceKeydown } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { focus } from '$ixirjs/ui/utils/dom.svelte';
	import { PopoverContext } from './bond.svelte';
	import type { PopoverOverlayProps } from './types';

	const bond = PopoverContext.getOrThrow('<Popover.Overlay /> must be used within a <Popover />');

	let {
		portal,
		layer: layerName = 'positioned',
		order = undefined,
		children = undefined,
		'z-index': zIndex = undefined,
		presetLayer = undefined,
		onkeydown = undefined,
		// The surface owns its style: the floating transform below is the whole point of this part.
		style: _style = undefined,
		...restProps
	}: PopoverOverlayProps = $props();

	const id = Kernel.id(bond.id, `${bond.name}-overlay`);
	const release = bond.attachPart('overlay', id);
	$effect(() => release);

	const isOpen = $derived(bond.isOpen);
	const strategy = $derived(bond.position?.strategy ?? 'absolute');

	// Escape (top-of-stack only) and the Tab trap, after the consumer's own handler.
	const surface = surfaceKeydown(bond, (_o, event) => bond.onEscape(event));
	function keydown(event: KeyboardEvent) {
		onkeydown?.(event as Parameters<NonNullable<typeof onkeydown>>[0]);
		if (!event.defaultPrevented) surface(event);
	}

	// Open at mount: move focus to the first text input in the surface unless the trigger already
	// holds one. Minted once so the node is not re-attached per invalidation.
	const focusKey = createAttachmentKey();
	function focusOnMount(element: HTMLElement) {
		const triggerElement = bond.element('trigger');
		if (!triggerElement || !bond.isOpen) return;

		const activeElement = document.activeElement as HTMLElement;
		const triggerContainsFocus =
			['input', 'textarea'].includes(activeElement.tagName.toLowerCase()) &&
			triggerElement.contains(activeElement);

		if (!triggerContainsFocus) {
			setTimeout(() => focus(element, ['textarea:not([disabled])', 'input:not([disabled])']), 0);
		}
	}

	// The dialog ARIA the surface carries; `aria-labelledby` only while a trigger rendered.
	const overlayAttrs = $derived.by(() => {
		const triggerId = bond.partId('trigger');
		const isActive = isOpen && !bond.isDisabled;
		return {
			id,
			role: 'dialog',
			'aria-modal': false,
			...(triggerId ? { 'aria-labelledby': triggerId } : {}),
			inert: !isActive ? true : undefined,
			tabindex: -1,
			'data-active': isActive,
			'data-state': isOpen ? 'open' : 'closed',
			onkeydown: keydown,
			[focusKey]: focusOnMount
		};
	});
	const overlayPresetLayer = $derived(bond.props.presets?.overlay ?? presetLayer);

	// Transform + opacity from the current floating-ui position.
	function calculatePosition() {
		const position = bond.position;

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
		const tailEl = bond.element('tail');
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
	{...overlayAttrs}
	{...restProps}
	presetLayer={overlayPresetLayer}
>
	{@render children?.({ popover: bond })}
</PortalSurface>
