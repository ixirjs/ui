<script lang="ts" generics="T">
	import { bindBond } from '$svelte-atoms/core/shared';
	import { DropdownBond, DropdownBondState, type DropdownStateProps } from './bond.svelte';
	import type { DropdownRootProps } from './types';

	let {
		open = $bindable(false),
		value = $bindable(),
		values = $bindable(),
		labels = $bindable(),
		label = $bindable(),
		multiple = false,
		disabled = false,
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
		placement = 'bottom-start',
		offset = 1,
		keys = [],
		factory = defaultFactory,
		children = undefined,
		onquerychange = undefined,
		...restProps
	}: DropdownRootProps<T> = $props();

	const binding = bindBond<DropdownBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => { open = v; }],
			// Component is generic over `T`; the bond's props are string-keyed — bridge with casts.
			values: [
				() => (multiple ? values : ([value].filter(Boolean) as T[])) as DropdownStateProps['values'],
				(v) => {
					values = v as T[];
					value = v?.[0] as T;
				}
			],
			label: [() => label, (v) => (label = v)],
			labels: [() => labels, (v) => (labels = v)],
			multiple: () => multiple,
			disabled: () => disabled,
			placement: () => placement as DropdownStateProps['placement'],
			offset: () => offset,
			placements: () => (placements ?? []) as DropdownStateProps['placements'],
			keys: () => keys ?? [],
			rest: () => restProps
		}
	);
	const bond = binding.bond.share();

	function defaultFactory(props: DropdownStateProps) {
		const bondState = new DropdownBondState(props);
		return new DropdownBond(bondState);
	}

	export function getBond() {
		return bond;
	}

	$effect(() => {
		return () => {
			bond.destroy();
		};
	});
</script>

{@render children?.({ dropdown: bond })}
