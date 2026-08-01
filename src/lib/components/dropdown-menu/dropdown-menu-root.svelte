<script lang="ts">
	import { DropdownMenuBond, DropdownMenuBondState, type DropdownMenuBondProps } from './bond.svelte';
	import { Root } from '../popover/atoms';
	import type { PopoverRootProps } from '../popover';

	let { open = $bindable(false), factory = defaultFactory, ...restProps }: PopoverRootProps = $props();

	function defaultFactory(props: DropdownMenuBondProps) {
		const menuBondState = new DropdownMenuBondState(props);
		return new DropdownMenuBond(menuBondState);
	}
</script>

<Root bind:open {factory} {...restProps} />
