<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'dialog', B extends Base = Base">
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { useFocusRestore, type OverlayView } from '$svelte-atoms/core/shared/overlay';
	import { bindBond } from '$svelte-atoms/core/shared';
	import { PopoverDialogBond, PopoverDialogBondState } from './bond.svelte';
	import type { PopoverDialogRootProps } from './types';

	let {
		open = $bindable(false),
		disabled = false,
		children = undefined,
		...restProps
	}: PopoverDialogRootProps<E, B> = $props();

	// The fused bond — Popover's trigger/disclosure + Dialog's modal presentation.
	// Root only owns state + context; the trigger renders in flow (`<PopoverDialog.Trigger>`)
	// and the modal self-portals from `<PopoverDialog.Content>` (§9.4.1).
	const binding = bindBond<PopoverDialogBond>(
		(props) => new PopoverDialogBond(new PopoverDialogBondState(props)),
		{
			open: [() => open, (v) => (open = v)],
			disabled: () => disabled,
			rest: () => restProps
		}
	);
	const bond = binding.bond.share();

	// Focus capture/restore reacts to `open` (restores to the trigger's prior focus on close).
	useFocusRestore(bond as unknown as OverlayView);

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ popoverDialog: bond })}
