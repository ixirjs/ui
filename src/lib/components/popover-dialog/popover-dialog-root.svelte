<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'dialog', B extends Base = Base">
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { bindBond, useCapabilities } from '$svelte-atoms/core/shared';
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
			// Vestigial: element-less context root, no typed channel to forward restProps.
			rest: () => restProps
		}
	);
	const bond = binding.bond.share();

	// Run capability setups — focus capture/restore reacts to `open`, restoring to the trigger's
	// prior focus on close, via the focus capability's setup() (ADR 0010).
	useCapabilities(bond);
	// Topmost-open-overlay Escape coordination (ADR 0009 D1/D2).

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ popoverDialog: bond })}
