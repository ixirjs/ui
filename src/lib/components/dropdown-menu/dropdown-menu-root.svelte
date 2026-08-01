<script lang="ts">
	import { DropdownMenuBond, type DropdownMenuBondProps } from './bond.svelte';
	import { Root } from '$ixirjs/ui/components/popover/atoms';
	import type { PopoverBond } from '$ixirjs/ui/components/popover/bond.svelte';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import type { DropdownMenuRootProps } from './types';

	let {
		open = $bindable(false),
		factory = defaultFactory,
		onopenchange = undefined,
		...restProps
	}: DropdownMenuRootProps = $props();

	// DropdownMenuBond composes PopoverBond (`parts:`) so it shares its atoms/context and is a
	// valid bond for <Root> — which drives open state via the bindable and never calls bond-level
	// open/close/toggle. defineBond's type doesn't surface those PopoverBond convenience methods
	// (parts: compose atoms+capabilities, not methods), so the factory needs the cast below.
	function defaultFactory(props: DropdownMenuBondProps): DropdownMenuBond {
		return DropdownMenuBond.create(props);
	}

	function popoverFactory(props: DropdownMenuBondProps): PopoverBond {
		return factory(props);
	}

	function forwardOpenChange(value: boolean, context: StateChangeContext<PopoverBond>): void {
		onopenchange?.(value, {
			...context,
			bond: context.bond as DropdownMenuBond
		});
	}
</script>

<Root bind:open factory={popoverFactory} onopenchange={forwardOpenChange} {...restProps} />
