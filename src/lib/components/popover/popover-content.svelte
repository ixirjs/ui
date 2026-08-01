<script lang="ts" generics="E extends HtmlElementTagName, B extends Base = Base">
	import { PortalBond, PortalsBond, resolvePortal } from '$svelte-atoms/core/components/portal';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { HtmlElementTagName } from '$svelte-atoms/core/components/element';
	import { clickout } from '$svelte-atoms/core/attachments';
	import { containsTarget } from '$svelte-atoms/core/utils/dom.svelte';
	import { PopoverBond } from './bond.svelte';
	import { animatePopoverContent } from './motion.svelte';
	import type { PopoverContentProps } from './types';
	import Floating from './strategies/floating.svelte';
	import PopoverOverlay from './popover-overlay.svelte';

	const bond = PopoverBond.getOrThrow('<PopoverOverlay /> must be used within a <Popover />');

	// Resolve the configured portal (id or bond); fall back to the ambient PortalBond when
	// none is configured or the id is unknown.
	const activePortalBond = $derived(
		resolvePortal(PortalsBond.get(), bond.state.props.portal) ?? PortalBond.get()
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
		"z-index": zIndex = undefined,
		...restProps
	}: PopoverContentProps<E, B> = $props();

	const atom = bond.atom('content');

	const presentation = $derived({ preset: preset ?? atom.preset });

	// Trigger measurements, in px. Lazy: only read by function sizers (raw-string paths skip it).
	// Re-runs on reposition so it tracks the trigger as it resizes.
	const triggerSize = $derived.by(() => {
		void bond.state.position;
		const trigger = bond.element<Element>('trigger');
		if (!(trigger instanceof Element)) return { width: 0, minWidth: 0, maxWidth: Infinity };
		return {
			width: trigger.clientWidth,
			get minWidth() {
				const computed = getComputedStyle(trigger);
				return parseFloat(computed.minWidth) || 0
			} 
			,
			get maxWidth() {
				const computed = getComputedStyle(trigger);
				return parseFloat(computed.maxWidth) || Infinity
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

	function clickoutAttachement(node: HTMLElement) {
		const cleanup = clickout((ev) => {
			if (onclickoutside) {
				onclickoutside(ev, bond);
				return;
			}

			if (containsTarget(bond.element('trigger'), ev.target)) {
				return;
			}

			bond.state.close();
		}, {})(node);

		return cleanup;
	}
</script>

<Floating />

<Overlay portal={activePortalBond ?? 'root.l0'} {layer} {order} as="div" z-index={zIndex}>
	<HtmlAtom
		{@attach clickoutAttachement}
		{bond}
		{fallback}
		class={[
			'popover-content bg-popover text-popover-foreground border-border rounded-md border p-2 opacity-0 shadow-lg outline-none',
			'$preset',
			klass
		]}
		{...presentation}
		{...contentProps}
	>
		{@render children?.({ popover: bond })}
	</HtmlAtom>
</Overlay>
