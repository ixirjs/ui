<script lang="ts">
	import type { ComboboxRootProps } from './types';
	import { controlledProp, useRoot } from '@ixirjs/ui/shared';
	import { ComboboxBond, type ComboboxBondProps } from './bond.svelte';

	const ID = $props.id();

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
		keys = [],
		query = $bindable(''),
		presets = undefined,
		factory = defaultFactory,
		children = undefined,
		onopenchange = undefined,
		onvaluechange = undefined,
		onvalueschange = undefined,
		onquerychange = undefined
	}: ComboboxRootProps = $props();

	function valuesEqual(left: readonly unknown[], right: readonly unknown[]) {
		return (
			left.length === right.length && left.every((item, index) => Object.is(item, right[index]))
		);
	}

	const openProp = controlledProp<boolean, ComboboxBond>({
		get: () => open,
		set: (next) => (open = next),
		onchange: (next, context) => onopenchange?.(next, context)
	});
	const valuesProp = controlledProp<ComboboxBondProps['values'], ComboboxBond>({
		get: () =>
			(multiple ? (values ?? []) : value == null ? [] : [value]) as ComboboxBondProps['values'],
		set: (next) => {
			const selected = (next ?? []) as unknown[];
			values = selected;
			value = selected[0];
		},
		equals: (left, right) => valuesEqual(left ?? [], right ?? []),
		onchange: (next, context) => {
			const selected = (next ?? []) as unknown[];
			if (multiple) onvalueschange?.(selected, context);
			else onvaluechange?.(selected[0], context);
		}
	});
	const labelProp = controlledProp<string | undefined, ComboboxBond>({
		get: () => label,
		set: (next) => (label = next)
	});
	const labelsProp = controlledProp<string[] | undefined, ComboboxBond>({
		get: () => labels,
		set: (next) => (labels = next)
	});
	const queryProp = controlledProp<string | undefined, ComboboxBond>({
		get: () => query,
		set: (next) => (query = next ?? ''),
		onchange: (next, context) => onquerychange?.(next ?? '', context)
	});

	const root = useRoot(
		ComboboxBond,
		{
			open: openProp,
			values: valuesProp,
			label: labelProp,
			labels: labelsProp,
			disabled: () => disabled,
			multiple: () => multiple,
			placement: () => placement as ComboboxBondProps['placement'],
			placements: () => (placements ?? []) as ComboboxBondProps['placements'],
			offset: () => offset,
			keys: () => keys,
			query: queryProp,
			presets: () => presets
		},
		{ atom: false, id: () => ID, factory: (props) => factory(props) }
	);
	const bond = root.bond;

	function defaultFactory(props: ComboboxBondProps) {
		return ComboboxBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ combobox: bond })}
