<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import {
		PortalContext,
		PortalsContext,
		resolveTeleportTarget
	} from '$ixirjs/ui/components/portal';
	import {
		contentStateAttrs,
		focusContentOnMount
	} from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { PopoverContext } from './bond.svelte';
	import { animatePopoverContent } from './motion.svelte';
	import type { PopoverContentProps } from './types';
	import Floating from './strategies/floating.svelte';
	import PopoverOverlay from './popover-overlay.svelte';

	const bond = PopoverContext.getOrThrow('<PopoverOverlay /> must be used within a <Popover />');

	// Resolve the configured portal (id or bond); fall back to the ambient PortalBond when
	// none is configured or the id is unknown.
	const portals = PortalsContext.get();
	const ambientPortal = PortalContext.get();
	const activePortalBond = $derived(
		resolveTeleportTarget(portals, bond.props.portal, ambientPortal)
	);

	let {
		overlay: Overlay = PopoverOverlay,
		layer = undefined,
		// A composing family (DatePicker) hands this part its own per-instance layer.
		presetLayer = undefined,
		order = undefined,
		as = undefined,
		base = undefined,
		animate = undefined,
		onmount = undefined,
		children = undefined,
		onclickoutside = undefined,
		width = undefined,
		minWidth = undefined,
		maxWidth = undefined,
		style = undefined,
		'z-index': zIndex = undefined,
		// swallowed: old fallback prop is removed; keep it off the DOM spread.
		fallback: _fallback = undefined,
		...restProps
	}: PopoverContentProps<'div'> = $props();

	const id = Kernel.id(bond.id, `${bond.name}-content`);
	const release = bond.attachPart('content', id);
	$effect(() => release);

	// The root's outside-press dismissal calls this before closing; preventing the default keeps
	// the popover open.
	bond.onclickoutside = (event) => onclickoutside?.(event as PointerEvent, bond);
	$effect(() => () => {
		bond.onclickoutside = undefined;
	});

	const enter = animatePopoverContent();

	// Focus the content when it mounts already open, after the consumer's own mount hook.
	//
	// An attachment, not the `onmount` element attribute: `onmount` only runs where Kernel renders
	// the element itself, so with a `base` renderer (DatePicker hands this part `Calendar.Root`) it
	// arrived at that component as an inert prop. An attachment rides the spread and reaches the
	// element either way. The key is minted once, at init.
	const mountKey = createAttachmentKey();
	function mount(node: HTMLElement) {
		const cleanup = onmount?.(node as HTMLDivElement);
		focusContentOnMount(bond, node);
		return cleanup;
	}

	// Trigger measurements, in px. Lazy: only read by function sizers (raw-string paths skip it).
	// Re-runs on reposition so it tracks the trigger as it resizes.
	const triggerSize = $derived.by(() => {
		void bond.position;
		const trigger = bond.element('trigger');
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

	const bodyArg = { popover: bond };
	const el = Kernel.element(() => restProps, {
		preset: `${bond.name}.content` as PresetModuleName,
		class:
			'popover-content bg-popover text-popover-foreground relative rounded-md border p-2 opacity-0 shadow-lg outline-none',
		state: bond,
		as: () => as,
		base: () => base,
		layer: () => presetLayer ?? bond.props.presets?.content,
		// The `animate` driver; a consumer's own (or `null`) replaces it.
		motion: () => ({ animate: animate === undefined ? enter : animate }),
		attrs: () => ({ id, ...contentStateAttrs(bond), style: sizeStyle, [mountKey]: mount })
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block, no
	// hydration anchor.
	const leaf = Kernel.render(el);
</script>

<Overlay portal={activePortalBond} {layer} {order} as="div" z-index={zIndex}>
	{@render leaf(el, children, bodyArg)}
	<!-- Mounted with the surface, so its first measurement finds the overlay element in the DOM. -->
	<Floating portal={activePortalBond} />
</Overlay>
