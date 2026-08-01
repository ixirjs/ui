<script lang="ts" generics="T">
	import { controlledProp, useRoot } from '@ixirjs/ui/shared';
	import { SelectBond, type SelectStateProps } from './bond.svelte';
	import type { SelectRootProps } from './types';

	const ID = $props.id();

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
		presets = undefined,
		// Arrow wrapper keeps the constructor facade bound when passed as a default factory.
		factory = (props: SelectStateProps) => SelectBond.create(props),
		children = undefined,
		onopenchange = undefined,
		onvaluechange = undefined,
		onvalueschange = undefined,
		onquerychange = undefined
	}: SelectRootProps<T> = $props();

	function valuesEqual(left: readonly T[], right: readonly T[]) {
		return (
			left.length === right.length && left.every((item, index) => Object.is(item, right[index]))
		);
	}

	const openProp = controlledProp<boolean, SelectBond>({
		get: () => open,
		set: (next) => (open = next),
		onchange: (next, context) => onopenchange?.(next, context)
	});
	const valuesProp = controlledProp<SelectStateProps['values'], SelectBond>({
		get: () =>
			(multiple
				? (values ?? [])
				: value === undefined
					? []
					: [value]) as SelectStateProps['values'],
		set: (next) => {
			const selected = (next ?? []) as T[];
			values = selected;
			value = selected[0] as T;
		},
		equals: (left, right) => valuesEqual((left ?? []) as T[], (right ?? []) as T[]),
		onchange: (next, context) => {
			const selected = (next ?? []) as T[];
			if (multiple) onvalueschange?.(selected, context);
			else onvaluechange?.(selected[0], context);
		}
	});
	const labelProp = controlledProp<string | undefined, SelectBond>({
		get: () => label,
		set: (next) => (label = next)
	});
	const labelsProp = controlledProp<string[] | undefined, SelectBond>({
		get: () => labels,
		set: (next) => (labels = next)
	});
	const queryProp = controlledProp<string | undefined, SelectBond>({
		get: () => query,
		set: (next) => (query = next ?? ''),
		onchange: (next, context) => onquerychange?.(next ?? '', context)
	});

	const root = useRoot(
		SelectBond,
		{
			open: openProp,
			values: valuesProp,
			label: labelProp,
			labels: labelsProp,
			multiple: () => multiple,
			disabled: () => disabled,
			placement: () => placement as SelectStateProps['placement'],
			offset: () => offset,
			placements: () => (placements ?? []) as SelectStateProps['placements'],
			keys: () => keys ?? [],
			query: queryProp,
			presets: () => presets
		},
		{ atom: false, id: () => ID, factory: (props) => factory(props) }
	);

	const bond = root.bond;

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ select: bond })}
