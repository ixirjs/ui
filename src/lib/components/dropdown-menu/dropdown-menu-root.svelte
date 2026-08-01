<script lang="ts">
	import { DropdownMenuBond, DropdownMenuBondState, type DropdownMenuBondProps } from './bond.svelte';
	import { Root } from '../popover/atoms';
	import type { PopoverRootProps } from '../popover';

	let { open = $bindable(false), factory = defaultFactory, ...restProps }: PopoverRootProps = $props();

	// Bespoke: DropdownMenuBond is a defineBond-style bond whose nominal open/close/toggle methods the
	// generic `bondFactory` structural inference would drop, breaking assignment to Factory<PopoverBond>.
	function defaultFactory(props: DropdownMenuBondProps) {
		const menuBondState = new DropdownMenuBondState(props);
		return new DropdownMenuBond(menuBondState);
	}
</script>

<Root bind:open {factory} {...restProps} />
