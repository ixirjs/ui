<script lang="ts" generics="T">
	import { bindBond } from '$svelte-atoms/core/shared';
	import { SelectBond, SelectBondState, type SelectStateProps } from './bond.svelte';
	import { useFocusRestore } from '$svelte-atoms/core/shared/overlay';
	import type { SelectRootProps } from './types';

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
		query = $bindable(''),
		factory = defaultFactory,
		children = undefined,
		onquerychange = undefined,
		...restProps
	}: SelectRootProps<T> = $props();

	const binding = bindBond<SelectBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => { open = v; }],
			// Component is generic over `T`; the bond's props are string-keyed — bridge with casts.
			values: [
				() => (multiple ? values : ([value].filter(Boolean) as T[])) as SelectStateProps['values'],
				(v) => {
					values = v as T[];
					value = v?.[0] as T;
				}
			],
			label: [() => label, (v) => (label = v)],
			labels: [() => labels, (v) => (labels = v)],
			multiple: () => multiple,
			disabled: () => disabled,
			placement: () => placement as SelectStateProps['placement'],
			offset: () => offset,
			placements: () => (placements ?? []) as SelectStateProps['placements'],
			keys: () => keys ?? [],
			// `query` is the bond-owned filter source (read by `createBondFilter`, cleared by
			// `ClearThenClose`). Wired here so writes are reactive and `bind:query` works;
			// `onquerychange` fires on each change.
			query: [() => query, (v) => { query = v ?? ''; onquerychange?.(v ?? ''); }],
			rest: () => restProps
		}
	);

	const bond = binding.bond.share();

	// Focus capture/restore reacts to `open` (ADR 0001 / ADR 0003).
	useFocusRestore(bond);

	function defaultFactory(props: SelectStateProps) {
		const bondState = new SelectBondState(props);
		return new SelectBond(bondState);
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

{@render children?.({ select: bond, dropdown: bond })}
