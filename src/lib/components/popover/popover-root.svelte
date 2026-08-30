<script lang="ts">
	import { untrack } from 'svelte';
	import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
	import { useOutsidePress, usePositioned } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { PopoverBond, PopoverContext, type PopoverBondBase } from './bond.svelte';
	import type { PopoverRootProps } from './types';

	// The nearest overlay host: an owning overlay gates this popover's open state.
	const owner = OverlayContext.get();

	const ID = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		placement = 'bottom',
		offset = 2,
		position = 'absolute',
		portal = undefined,
		presets = undefined,
		factory = undefined,
		onopenchange = undefined,
		children = undefined
	}: PopoverRootProps = $props();

	// Live props: read through getters wherever the Bond needs them.
	const bondProps = {
		get id() {
			return ID;
		},
		get open() {
			return open && (owner?.isOpen ?? true);
		},
		get disabled() {
			return disabled;
		},
		get placement() {
			return placement;
		},
		get offset() {
			return offset;
		},
		get position() {
			return position;
		},
		get placements() {
			return placements ?? [];
		},
		get portal() {
			return portal;
		},
		get presets() {
			return presets;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = PopoverContext.share(build ? build(bondProps) : PopoverBond.create(bondProps));
	OverlayContext.share(bond);
	// Controlled state: the Bond decides, the root writes, the callback fires after the write with
	// the staged `event`/`reason` a dismissal handed it.
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});
	usePositioned(bond);
	useOutsidePress(bond, {
		event: 'click',
		onDismiss: (event, o) => (o as PopoverBondBase).onclickoutside?.(event, o as PopoverBondBase)
	});

	export const getBond = () => bond;
</script>

{@render children?.({ popover: bond })}
