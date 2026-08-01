<script lang="ts" generics="E extends HtmlElementTagName, B extends Base = Base">
	import { PortalBond, PortalsBond, resolvePortal } from '$svelte-atoms/core/components/portal';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance, type Atom } from '$svelte-atoms/core/shared/bond';
	import type { HtmlElementTagName } from '$svelte-atoms/core/components/element';
	import {
		OUTSIDE_PRESS,
		type DismissPressEvent,
		type OverlayView
	} from '$svelte-atoms/core/components/portal/host';
	import {
		createPopoverAtom,
		getPopoverPosition,
		PopoverBond,
		PopoverContentAtom,
		popoverNode
	} from './bond.svelte';
	import { animatePopoverContent } from './motion.svelte';
	import type { PopoverContentProps } from './types';
	import Floating from './strategies/floating.svelte';
	import PopoverOverlay from './popover-overlay.svelte';

	const bond = PopoverBond.getOrThrow('<PopoverOverlay /> must be used within a <Popover />');

	// Resolve the configured portal (id or bond); fall back to the ambient PortalBond when
	// none is configured or the id is unknown.
	const activePortalBond = $derived(
		resolvePortal(PortalsBond.get(), bond.props.portal) ?? PortalBond.get()
	);

	let {
		class: klass = '',
		overlay: Overlay = PopoverOverlay,
		layer = undefined,
		order = undefined,
		preset = undefined,
		children = undefined,
		onclickoutside = undefined,
		width = undefined,
		minWidth = undefined,
		maxWidth = undefined,
		style = undefined,
		fallback = {
			animate: animatePopoverContent()
		},
		'z-index': zIndex = undefined,
		...restProps
	}: PopoverContentProps<E, B> = $props();

	const atom = createAtomInstance<Atom<PopoverBond, HTMLElement>, PopoverBond, HTMLElement>(
		'content',
		{
			bond,
			factory: (owner) =>
				createPopoverAtom(
					owner as PopoverBond,
					'content',
					(popover) => new PopoverContentAtom(popover)
				)
		}
	);
	const outsidePress = $derived(bond.surface(OUTSIDE_PRESS));

	const presentation = $derived({ preset: preset ?? atom.preset });

	$effect(() => {
		return outsidePress?.configure(
			onclickoutside
				? {
						onDismiss: (ev: DismissPressEvent, overlay: OverlayView) =>
							onclickoutside(ev as PointerEvent, overlay as PopoverBond)
					}
				: {}
		);
	});

	// Trigger measurements, in px. Lazy: only read by function sizers (raw-string paths skip it).
	// Re-runs on reposition so it tracks the trigger as it resizes.
	const triggerSize = $derived.by(() => {
		void getPopoverPosition(bond);
		const trigger = popoverNode(bond, 'trigger')?.element;
		if (!(trigger instanceof Element)) return { width: 0, minWidth: 0, maxWidth: Infinity };
		return {
			width: trigger.clientWidth,
			get minWidth() {
				const computed = getComputedStyle(trigger);
				return parseFloat(computed.minWidth) || 0;
			},
			get maxWidth() {
				const computed = getComputedStyle(trigger);
				return parseFloat(computed.maxWidth) || Infinity;
			}
		};
	});

	// Function → compute from trigger measurements; string → raw CSS length, passed through.
	const anchor = (value: typeof width) =>
		typeof value === 'function' ? value(triggerSize) : value;

	// Merged ahead of a consumer-supplied `style` so explicit overrides still win.
	const sizeStyle = $derived(
		[
			width && `width:${anchor(width)}`,
			minWidth && `min-width:${anchor(minWidth)}`,
			maxWidth && `max-width:${anchor(maxWidth)}`,
			style
		]
			.filter(Boolean)
			.join(';') || undefined
	);

	const contentProps = $derived({
		...atom.spread,
		style: sizeStyle,
		...restProps
	});
</script>

<Floating />

<Overlay portal={activePortalBond ?? 'root.l0'} {layer} {order} as="div" z-index={zIndex}>
	<HtmlAtom
		{bond}
		{fallback}
		class={[
			'popover-content bg-popover text-popover-foreground rounded-md border p-2 opacity-0 shadow-lg outline-none',
			'$preset',
			klass
		]}
		{...presentation}
		{...contentProps}
	>
		{@render children?.({ popover: bond })}
	</HtmlAtom>
</Overlay>
