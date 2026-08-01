<script lang="ts">
	import { PopoverState, PopoverBond } from './bond.svelte';
	import type { PopoverStateProps } from './bond.svelte';
	import { useFocusRestore } from '$svelte-atoms/core/shared/overlay';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import type { PopoverRootProps } from './types';
	import { DialogBond } from '../dialog/bond.svelte';
	import { DrawerBond } from '../drawer';
	import { SidebarBond } from '../sidebar';

	interface PopoverOwnerState {
		readonly props: PopoverStateProps;

		open: () => void;
		close: () => void;
		toggle: () => void;
	}
	interface PopoverOwner {
		readonly state: PopoverOwnerState;
	}

	const owner = (()=> {
		const potentialOwners = [DialogBond, DrawerBond, SidebarBond];
		for (const potentialOwner of potentialOwners) {
			try {
				return potentialOwner.get() as unknown as PopoverOwner;
			} catch {
				continue;
			}
		}
		
		return null;
	})();

	const positionStrategy = $derived.by(()=> {
		if(owner instanceof DialogBond){
			return 'fixed';
		}

		return 'absolute';
	})

	let {
		open = $bindable(false),
		disabled = false,
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		placement = 'bottom',
		offset = 1,
		portal = undefined,
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: PopoverRootProps = $props();

	const binding = bindBond<PopoverBond>(
		(props) => factory(props),
		{
			open: [() => open && (owner?.state?.props?.open ?? true), (v) => { open = v; }],
			disabled: () => disabled,
			placement: () => placement,
			offset: () => offset,
			placements: () => placements ?? [],
			portal: () => portal,
			positionStrategy: () => positionStrategy,
			rest: () => restProps
		}
	);
	const bond = binding.bond.share();

	// Focus capture/restore is a state-reactive consequence of `open`, not an
	// imperative kernel method (ADR 0001 / ADR 0003). Covers popover, menu,
	// dropdown-menu, context-menu, tooltip and date-picker — all render via this Root.
	useFocusRestore(bond);

	function defaultFactory(props: PopoverStateProps) {
		const popoverState = new PopoverState(props);
		const popoverBond = new PopoverBond(popoverState);

		return popoverBond;
	}

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ popover: bond })}
