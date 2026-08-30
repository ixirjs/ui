<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import {
		capturePointer,
		dragDetail,
		releasePointer,
		shouldSkipPolicy
	} from '$ixirjs/ui/capability/models/interaction-policies/shared';
	import { ScrollableContext } from './bond.svelte';
	import type { ScrollableThumbProps } from './types';

	let {
		as = undefined,
		base = undefined,
		orientation = 'vertical',
		children,
		...restProps
	}: ScrollableThumbProps = $props();
	const bond = ScrollableContext.getOrThrow('ScrollableThumb must be used within a ScrollableRoot');

	// The axis is fixed at init, like the Atom it replaces was.
	const axis = untrack(() => orientation) === 'horizontal' ? 'x' : 'y';

	// Thumb drag: pointer events with capture and cancel handling.
	const disabled = () => bond.props.disabled;
	let start: { pointerId: number; x: number; y: number } | undefined;
	const delta = (event: PointerEvent) => {
		const detail = dragDetail(start!, event, axis);
		return axis === 'x' ? detail.deltaX : detail.deltaY;
	};
	function onpointerdown(event: PointerEvent) {
		if (shouldSkipPolicy(disabled, bond as never, event)) return;
		start = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
		capturePointer(event);
		bond.beginThumbDrag(axis);
	}
	function onpointermove(event: PointerEvent) {
		if (!start || event.pointerId !== start.pointerId) return;
		if (shouldSkipPolicy(disabled, bond as never, event)) {
			releasePointer(event);
			start = undefined;
			return;
		}
		bond.dragThumbBy(axis, delta(event));
	}
	function onpointerup(event: PointerEvent) {
		if (!start || event.pointerId !== start.pointerId) return;
		releasePointer(event);
		start = undefined;
		if (shouldSkipPolicy(disabled, bond as never, event)) return;
		bond.endThumbDrag();
	}
	function onpointercancel(event: PointerEvent) {
		if (!start || event.pointerId !== start.pointerId) return;
		releasePointer(event);
		start = undefined;
		bond.endThumbDrag();
	}

	const el = Kernel.element(() => restProps, {
		preset: 'scrollable.thumb',
		class: `scrollable-thumb bg-foreground/10 hover:bg-foreground/20 absolute cursor-grab rounded-md active:cursor-grabbing ${axis === 'x' ? 'scrollable-thumb-x h-full' : 'scrollable-thumb-y w-full'}`,
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => {
			const position = axis === 'x' ? bond.getThumbXPosition() : bond.getThumbYPosition();
			const size = axis === 'x' ? bond.getThumbXSize() : bond.getThumbYSize();
			return {
				id: bond.partId(axis === 'x' ? 'thumbX' : 'thumbY'),
				'data-direction': axis === 'x' ? 'horizontal' : 'vertical',
				style: `${axis === 'x' ? 'left' : 'top'}: ${position}%; ${axis === 'x' ? 'width' : 'height'}: ${size}%;`,
				onpointerdown,
				onpointermove,
				onpointerup,
				onpointercancel
			};
		}
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
