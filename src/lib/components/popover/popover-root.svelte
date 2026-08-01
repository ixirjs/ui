<script lang="ts">
	import { PopoverBond } from './bond.svelte';
	import { OverlayBond } from '$ixirjs/ui/components/overlay';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import type { PopoverRootProps } from './types';

	const owner = OverlayBond.get() ?? null;

	const ID = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'],
		placement = 'bottom',
		offset = 2,
		position = 'absolute',
		portal = undefined,
		presets = undefined,
		factory = undefined,
		onopenchange = undefined,
		children = undefined
	}: PopoverRootProps = $props();

	const openProp = controlledProp<boolean, PopoverBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		PopoverBond,
		{
			// Composed, not the controlled prop itself: an owning overlay gates this popover's open
			// state. Because the spec entry is a derived tuple rather than the `ControlledProp`, it
			// carries no adoption of its own and this root declares `connect` explicitly.
			open: [() => openProp.value && (owner?.isOpen ?? true), openProp[1]],
			disabled: () => disabled,
			placement: () => placement,
			offset: () => offset,
			position: () => position,
			placements: () => placements ?? [],
			portal: () => portal,
			presets: () => presets
		},
		{
			atom: false,
			id: () => ID,
			factory: () => factory,
			connect: (bond) => void openProp.connect(bond)
		}
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ popover: bond })}
