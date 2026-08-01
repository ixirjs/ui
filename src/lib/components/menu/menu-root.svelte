<script lang="ts">
	import { MenuBond, MenuBondState, type MenuBondProps } from './bond.svelte';
	import { Root } from '../popover/atoms';

	let { open = $bindable(false), factory = defaultFactory, children, ...restProps } = $props();

	function defaultFactory(props: MenuBondProps) {
		const menuBondState = new MenuBondState(props);
		return new MenuBond(menuBondState);
	}
</script>

<Root bind:open {factory} {...restProps}>
	{@render children?.()}
</Root>
