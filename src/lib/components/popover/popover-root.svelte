<script lang="ts">
	import { PopoverBond, type PopoverBondProps } from './bond.svelte';
	import { OverlayBond } from '$svelte-atoms/core/components/portal/host';
	import { useCapabilities } from '$svelte-atoms/core/shared/capability/use.svelte';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import type { PopoverRootProps } from './types';

	const owner = OverlayBond.get() ?? null;

	let {
		open = $bindable(false),
		disabled = false,
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		placement = 'bottom',
		offset = 2,
		position = 'absolute',
		portal = undefined,
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: PopoverRootProps = $props();

	function defaultFactory(props: PopoverBondProps): PopoverBond {
		return PopoverBond.create(props);
	}

	let openState = $derived(open);

	const binding = bindBond<PopoverBond>((props) => factory(props), {
		open: [
			() => openState && (owner?.isOpen ?? true),
			(v) => {
				openState = v;
				open = openState;
			}
		],
		disabled: () => disabled,
		placement: () => placement,
		offset: () => offset,
		position: () => position,
		placements: () => placements ?? [],
		portal: () => portal,
		// Vestigial: this element-less context root has no typed channel to forward restProps
		// (its rest type doesn't overlap bond state props). Kept to consume restProps; see note.
		rest: () => restProps
	});
	const bond = binding.bond.share();

	// Activate the bond's capability setups: the focus capability captures activeElement on open
	// and restores it on close (so every overlay rendering via this Root gets it automatically),
	// and the escape capability enrolls this overlay in the topmost-open-overlay stack so only
	// the frontmost surface acts on Escape.
	useCapabilities(bond);

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ popover: bond })}
