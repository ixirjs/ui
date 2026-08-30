<script lang="ts">
	import { untrack } from 'svelte';
	import { useMenuRoot } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
	import { ContextMenuBond, ContextMenuContext, type ContextMenuBondProps } from './bond.svelte';
	import type { ContextMenuRootProps } from './types';

	const ID = $props.id();

	// Trigger is often a large element (row, card, image), so content sizes to its own `min-w-*`
	// rather than the trigger. Opt back in per-instance with `minWidth` on the content.
	let {
		open = $bindable(false),
		disabled = false,
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		placement = 'bottom-start',
		offset = 2,
		position = 'absolute',
		portal = undefined,
		presets = undefined,
		factory = undefined,
		onopenchange = undefined,
		children = undefined
	}: ContextMenuRootProps = $props();

	const bondProps: ContextMenuBondProps = {
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
	const build = untrack(() => factory);
	const bond = build ? build(bondProps) : ContextMenuBond.create(bondProps);
	useMenuRoot(bond);
	ContextMenuContext.share(bond);
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});

	export const getBond = () => bond;
</script>

{@render children?.({ popover: bond })}
