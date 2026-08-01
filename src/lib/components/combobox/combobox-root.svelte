<script lang="ts" generics="D">
	import type { ComboboxRootProps } from './types';
	import { bindBond } from '$svelte-atoms/core/shared';
	import { ComboboxBond, ComboboxBondState, type ComboboxBondProps } from './bond.svelte';
	import { useFocusRestore } from '$svelte-atoms/core/shared/overlay';

	let {
		open = $bindable(false),
		value = $bindable(),
		values = $bindable(),
		label = $bindable(),
		labels = $bindable(),
		multiple = false,
		disabled = false,
		placements = ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
		placement = 'bottom-start',
		offset = 1,
		query = $bindable(''),
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: ComboboxRootProps = $props();

	const binding = bindBond<ComboboxBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => { open = v; }],
			// Component is generic over `D`; the bond's props are string-keyed — bridge with casts.
			values: [
				() => (multiple ? values : [value]) as ComboboxBondProps['values'],
				(v) => {
					values = v;
					value = v?.[0];
				}
			],
			label: [() => label, (v) => (label = v)],
			labels: [() => labels, (v) => (labels = v)],
			disabled: () => disabled,
			multiple: () => multiple,
			placements: () => (placements ?? []) as ComboboxBondProps['placements'],
			offset: () => offset,
			// Bond-owned filter source (read by `createBondFilter`, cleared by `ClearThenClose`).
			// Wired as an accessor so writes are reactive and `bind:query` works.
			query: [() => query, (v) => { query = v ?? ''; }]
		},
		// Frozen base — only genuinely-static defaults / restProps spread belong here.
		{ base: () => ({ placement: 'bottom-start', ...restProps }) }
	);
	const bond = binding.bond.share();

	// Focus capture/restore reacts to `open` (ADR 0001 / ADR 0003).
	useFocusRestore(bond);

	function defaultFactory(props: ComboboxBondProps) {
		const bondState = new ComboboxBondState<D>(props);

		return new ComboboxBond(bondState).share();
	}

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ combobox: bond })}
