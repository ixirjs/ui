<script lang="ts">
	import { Root } from '$ixirjs/ui/components/dropdown-menu/atoms';
	import type { DropdownMenuBond } from '$ixirjs/ui/components/dropdown-menu';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import { ContextMenuBond, type ContextMenuBondProps } from './bond.svelte';
	import type { ContextMenuRootProps } from './types';

	// Trigger is often a large element (row, card, image), so content sizes to its own `min-w-*`
	// rather than the trigger. Opt back in per-instance with `minWidth` on the content.
	let {
		open = $bindable(false),
		placement = 'bottom-start',
		factory = defaultFactory,
		onopenchange = undefined,
		...restProps
	}: ContextMenuRootProps = $props();

	function defaultFactory(props: ContextMenuBondProps): ContextMenuBond {
		return ContextMenuBond.create(props);
	}

	function dropdownFactory(props: ContextMenuBondProps): DropdownMenuBond {
		return factory(props);
	}

	function forwardOpenChange(value: boolean, context: StateChangeContext<DropdownMenuBond>): void {
		onopenchange?.(value, {
			...context,
			bond: context.bond as ContextMenuBond
		});
	}
</script>

<Root
	bind:open
	{placement}
	factory={dropdownFactory}
	onopenchange={forwardOpenChange}
	{...restProps}
/>
