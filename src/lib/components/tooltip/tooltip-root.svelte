<script lang="ts">
	import PopoverRoot from '$ixirjs/ui/components/popover/popover-root.svelte';
	import type { PopoverBond } from '$ixirjs/ui/components/popover/bond.svelte';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import { TooltipBond, type TooltipBondProps } from './bond.svelte';
	import type { TooltipRootProps } from './types';

	let {
		open = $bindable(false),
		factory = defaultFactory,
		onopenchange = undefined,
		...restProps
	}: TooltipRootProps = $props();

	// Construct a TooltipBond (name 'tooltip') instead of the default PopoverBond, so the
	// shared popover atoms resolve their presets under the `tooltip.*` namespace. The bond is
	// shared under popover's context keys too (via `parts: [PopoverBond]`), so `<Popover.*>`
	// atom components still find it.
	function defaultFactory(bondProps: TooltipBondProps): TooltipBond {
		return TooltipBond.create(bondProps);
	}

	function popoverFactory(bondProps: TooltipBondProps): PopoverBond {
		return factory(bondProps);
	}

	function forwardOpenChange(value: boolean, context: StateChangeContext<PopoverBond>): void {
		onopenchange?.(value, {
			...context,
			bond: context.bond as TooltipBond
		});
	}
</script>

<PopoverRoot bind:open factory={popoverFactory} onopenchange={forwardOpenChange} {...restProps} />
