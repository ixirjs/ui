<script lang="ts">
	import { untrack } from 'svelte';
	import { DropdownMenuBond, useMenuRoot, type DropdownMenuBondProps } from './bond.svelte';
	import type { DropdownMenuRootProps } from './types';

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
	}: DropdownMenuRootProps = $props();

	// Live props: read through getters wherever the Bond needs them.
	const bondProps: DropdownMenuBondProps = {
		get id() {
			return ID;
		},
		get open() {
			return open;
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
	const bond = build ? build(bondProps) : DropdownMenuBond.create(bondProps);
	useMenuRoot(bond);
	// Controlled state: the Bond decides, the root writes, the callback fires after the write with
	// the staged `event`/`reason` a dismissal handed it.
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});

	export const getBond = () => bond;
</script>

{@render children?.({ popover: bond })}
