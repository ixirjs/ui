<script lang="ts" generics="T">
	import { bondFactory,bindBond, useCapabilities } from '$svelte-atoms/core/shared';
	import { SelectBond, SelectBondState, type SelectStateProps } from './bond.svelte';
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
		factory = bondFactory(SelectBondState, SelectBond),
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
			// Bond-owned filter source: accessor wiring makes writes reactive for `bind:query`
			// and fires `onquerychange` (read by `createBondFilter`, cleared by `ClearThenClose`).
			query: [() => query, (v) => { query = v ?? ''; onquerychange?.(v ?? ''); }],
			// Vestigial: element-less context root, no typed channel to forward restProps.
			rest: () => restProps
		}
	);

	const bond = binding.bond.share();

	// Run capability setups — focus capture/restore reacts to `open` via the focus capability's
	// setup() (ADR 0001 / ADR 0003, ADR 0010).
	useCapabilities(bond);
	// Topmost-open-overlay Escape coordination (ADR 0009 D1/D2).


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
