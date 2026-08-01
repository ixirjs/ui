<script lang="ts">
	import { Root } from '../dropdown-menu/atoms';
	import type { PopoverBond, PopoverRootProps } from '../popover';
	import { ContextMenuBond, type ContextMenuBondProps } from './bond.svelte';

	// Trigger is often a large element (row, card, image), so content sizes to its own `min-w-*`
	// rather than the trigger. Opt back in per-instance with `minWidth` on the content.
	let {
		placement = 'bottom-start',
		factory = defaultFactory,
		...restProps
	}: PopoverRootProps = $props();

	function defaultFactory(props: ContextMenuBondProps): PopoverBond {
		return ContextMenuBond.create(props) as unknown as PopoverBond;
	}
</script>

<Root {placement} {factory} {...restProps} />
