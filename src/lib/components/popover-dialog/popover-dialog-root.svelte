<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'dialog', B extends Base = Base"
>
	import type { Base } from '$ixirjs/ui/components/atom';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { PopoverDialogBond } from './bond.svelte';
	import type { PopoverDialogRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		presets = undefined,
		onopenchange = undefined,
		children = undefined
	}: PopoverDialogRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, PopoverDialogBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	// The fused bond — Popover's trigger/disclosure + Dialog's modal presentation.
	// Root only owns state + context; the trigger renders in flow (`<PopoverDialog.Trigger>`)
	// and the modal self-portals from `<PopoverDialog.Content>`.
	const root = useRoot(
		PopoverDialogBond,
		{
			open: openProp,
			disabled: () => disabled,
			presets: () => presets
		},
		{ atom: false, id: () => ID }
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ popoverDialog: bond })}
