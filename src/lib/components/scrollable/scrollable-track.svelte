<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import {
		shouldSkipPolicy,
		trackPressDetail
	} from '$ixirjs/ui/capability/models/interaction-policies/shared';
	import { ScrollableContext } from './bond.svelte';
	import type { ScrollableTrackProps } from './types';

	let {
		as = undefined,
		base = undefined,
		orientation = 'vertical',
		children,
		...restProps
	}: ScrollableTrackProps = $props();
	const bond = ScrollableContext.getOrThrow('ScrollableTrack must be used within a ScrollableRoot');

	// The axis is fixed at init, like the Atom it replaces was.
	const axis = untrack(() => orientation) === 'horizontal' ? 'x' : 'y';

	const hasScroll = $derived(bond.canScrollX || bond.canScrollY);
	const isOpen = $derived(bond.props.open ?? true);
	const isScrolling = $derived(bond.props.isScrolling ?? false);

	// Track press: jump to the pressed fraction. Pointer, primary button, not disabled.
	const disabled = () => bond.props.disabled;
	function onpointerdown(event: PointerEvent) {
		if (shouldSkipPolicy(disabled, bond as never, event)) return;
		event.preventDefault();
		const detail = trackPressDetail(event);
		bond.scrollToTrackFraction(axis, axis === 'x' ? detail.percentX : detail.percentY);
	}

	const el = Kernel.element(() => restProps, {
		preset: 'scrollable.track',
		class: `scrollable-track bg-foreground/10 hover:bg-foreground/15 absolute z-10 rounded transition-opacity ${axis === 'y' ? 'inset-y-0 right-0 w-2' : 'inset-x-0 bottom-0 h-2'}`,
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => ({
			id: bond.partId(axis === 'x' ? 'trackX' : 'trackY'),
			'data-visible': axis === 'x' ? bond.canScrollX : bond.canScrollY,
			'data-direction': axis === 'x' ? 'horizontal' : 'vertical',
			onpointerdown
		})
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render ((isOpen || isScrolling) && hasScroll ? track : undefined)?.()}

{#snippet track()}
	{@render leaf(el, children)}
{/snippet}
