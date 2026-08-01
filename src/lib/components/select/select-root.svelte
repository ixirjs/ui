<script lang="ts" generics="T">
	import { bindBond, useCapabilities } from '$svelte-atoms/core/shared';
	import { SelectBond, type SelectStateProps } from './bond.svelte';
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
		// Arrow wrapper keeps `this` bound to SelectBond when used as a detached default.
		factory = (props: SelectStateProps) => SelectBond.create(props),
		children = undefined,
		onquerychange = undefined,
		...restProps
	}: SelectRootProps<T> = $props();

	let openState = $derived(open);
	let valueState = $derived<T | undefined>(value);
	let valuesState = $derived<T[] | undefined>(values);
	let labelState = $derived<string | undefined>(label);
	let labelsState = $derived<string[] | undefined>(labels);
	let queryState = $derived(query);

	const binding = bindBond<SelectBond>((props) => factory(props), {
		open: [
			() => openState,
			(v) => {
				openState = v;
				open = openState;
			}
		],
		// Component is generic over `T`; the bond's props are string-keyed — bridge with casts.
		values: [
			() =>
				(multiple
					? valuesState
					: ([valueState].filter(Boolean) as T[])) as SelectStateProps['values'],
			(v) => {
				valuesState = v as T[];
				valueState = valuesState?.[0];
				values = valuesState;
				value = valueState as T;
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
		multiple: () => multiple,
		disabled: () => disabled,
		placement: () => placement as SelectStateProps['placement'],
		offset: () => offset,
		placements: () => (placements ?? []) as SelectStateProps['placements'],
		keys: () => keys ?? [],
		// Bond-owned filter source: accessor wiring makes writes reactive for `bind:query`
		// and fires `onquerychange` (read by `createBondFilter`, cleared by `ClearThenClose`).
		query: [
			() => queryState,
			(v) => {
				queryState = v ?? '';
				query = queryState;
				onquerychange?.(queryState);
			}
		],
		// Vestigial: element-less context root, no typed channel to forward restProps.
		rest: () => restProps
	});

	const bond = binding.bond.share();

	// Activate the bond's capability setups: the focus capability captures activeElement on
	// open and restores it on close, and the escape capability enrolls this overlay in the
	// topmost-open-overlay stack so only the frontmost surface acts on Escape.
	useCapabilities(bond);

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
