<script lang="ts">
	import { PopoverState, PopoverBond } from './bond.svelte';
	import { bondFactory } from '$svelte-atoms/core/shared';
	import { OverlayBond } from '$svelte-atoms/core/components/overlay';
	import { useCapabilities } from '$svelte-atoms/core/shared/use-capabilities.svelte';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import type { PopoverRootProps } from './types';

	const owner = OverlayBond.get() ?? null;

	let {
		open = $bindable(false),
		disabled = false,
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		placement = 'bottom',
		offset = 2,
		portal = undefined,
		factory = bondFactory(PopoverState, PopoverBond),
		children = undefined,
		...restProps
	}: PopoverRootProps = $props();

	const binding = bindBond<PopoverBond>(
		(props) => factory(props),
		{
			open: [() => open && (owner?.isOpen ?? true), (v) => { open = v; }],
			disabled: () => disabled,
			placement: () => placement,
			offset: () => offset,
			placements: () => placements ?? [],
			portal: () => portal,
			// Vestigial: this element-less context root has no typed channel to forward restProps
			// (its rest type doesn't overlap bond state props). Kept to consume restProps; see note.
			rest: () => restProps
		}
	);
	const bond = binding.bond.share();

	// Run the bond's capability setups — focus capture/restore (ADR 0001/0003) now lives on the
	// focus capability's setup(), so every overlay rendering via this Root gets it automatically (#5).
	useCapabilities(bond);
	// Topmost-open-overlay Escape coordination (ADR 0009 D1/D2).


	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ popover: bond })}
