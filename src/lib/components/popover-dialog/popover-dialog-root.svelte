<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'dialog', B extends Base = Base"
>
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { bindBond, useCapabilities } from '$svelte-atoms/core/shared';
	import { PopoverDialogBond } from './bond.svelte';
	import type { PopoverDialogRootProps } from './types';

	let {
		open = $bindable(false),
		disabled = false,
		children = undefined,
		...restProps
	}: PopoverDialogRootProps<E, B> = $props();

	let openState = $derived(open);

	// The fused bond — Popover's trigger/disclosure + Dialog's modal presentation.
	// Root only owns state + context; the trigger renders in flow (`<PopoverDialog.Trigger>`)
	// and the modal self-portals from `<PopoverDialog.Content>`.
	const binding = bindBond<PopoverDialogBond>((props) => new PopoverDialogBond(props), {
		open: [
			() => openState,
			(v) => {
				openState = v;
				open = openState;
			}
		],
		disabled: () => disabled,
		// Vestigial: element-less context root, no typed channel to forward restProps.
		rest: () => restProps
	});
	const bond = binding.bond.share();

	// Activate the bond's capability setups: the focus capability captures activeElement on open
	// and restores it to the trigger's prior focus on close, and the escape capability enrolls
	// this overlay in the topmost-open-overlay stack so only the frontmost surface acts on Escape.
	useCapabilities(bond);

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ popoverDialog: bond })}
