<script lang="ts">
	import type { ComboboxRootProps } from './types';
	import { bindBond, useCapabilities } from '$svelte-atoms/core/shared';
	import { ComboboxBond, type ComboboxBondProps } from './bond.svelte';

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

	let openState = $derived(open);
	let valueState = $derived(value);
	let valuesState = $derived(values);
	let labelState = $derived(label);
	let labelsState = $derived(labels);
	let queryState = $derived(query);

	const binding = bindBond<ComboboxBond>((props) => factory(props), {
		open: [
			() => openState,
			(v) => {
				openState = v;
				open = openState;
			}
		],
		// The bond's props are string-keyed; the bindables are loosely typed — bridge with casts.
		values: [
			() => (multiple ? valuesState : [valueState]) as ComboboxBondProps['values'],
			(v) => {
				valuesState = v;
				valueState = valuesState?.[0];
				values = valuesState;
				value = valueState;
			}
		],
		label: [
			() => labelState,
			(v) => {
				labelState = v;
				label = labelState;
			}
		],
		labels: [
			() => labelsState,
			(v) => {
				labelsState = v;
				labels = labelsState;
			}
		],
		disabled: () => disabled,
		multiple: () => multiple,
		placement: () => placement as ComboboxBondProps['placement'],
		placements: () => (placements ?? []) as ComboboxBondProps['placements'],
		offset: () => offset,
		// Bond-owned filter source (read by `createBondFilter`, cleared by `ClearThenClose`).
		// Wired as an accessor so writes are reactive and `bind:query` works.
		query: [
			() => queryState,
			(v) => {
				queryState = v ?? '';
				query = queryState;
			}
		],
		// Vestigial: element-less context root, no typed channel to forward restProps.
		rest: () => restProps
	});
	const bond = binding.bond.share();

	useCapabilities(bond);

	function defaultFactory(props: ComboboxBondProps) {
		return ComboboxBond.create(props).share();
	}

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ combobox: bond })}
