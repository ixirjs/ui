<script lang="ts">
	import { PopupBond } from '$ixirjs/ui/components/overlay/popup/bond.svelte';
	import { useMenuRoot } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
	import { SelectContext } from '$ixirjs/ui/components/select/bond.svelte';
	import { ComboboxContext, type ComboboxBondProps } from './bond.svelte';
	import type { ComboboxRootProps } from './types';

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

	// Live props. The setters are the controlled seam: a write the Bond makes lands on the bindable
	// and reports once; a write the PARENT makes never passes through here, so a re-render of the
	// owner cannot echo back as a change callback.
	const bondProps: ComboboxBondProps = {
		get id() {
			return ID;
		},
		get open() {
			return open;
		},
		get disabled() {
			return disabled;
		},
		get multiple() {
			return multiple;
		},
		get placement() {
			return placement as ComboboxBondProps['placement'];
		},
		get placements() {
			return (placements ?? []) as ComboboxBondProps['placements'];
		},
		get offset() {
			return offset;
		},
		get position() {
			return 'absolute' as const;
		},
		get keys() {
			return keys;
		},
		get presets() {
			return presets;
		},
		get values() {
			return (multiple ? (values ?? []) : value == null ? [] : [value]) as string[];
		},
		set values(next: string[]) {
			const selected = next as unknown[];
			const current = (multiple ? (values ?? []) : value == null ? [] : [value]) as unknown[];
			if (valuesEqual(selected, current)) return;
			values = selected;
			value = selected[0];
			if (multiple) onvalueschange?.(selected, { bond });
			else onvaluechange?.(selected[0], { bond });
		},
		get label() {
			return label;
		},
		set label(next: string | undefined) {
			label = next;
		},
		get labels() {
			return labels;
		},
		set labels(next: string[] | undefined) {
			labels = next;
		},
		get query() {
			return query;
		},
		set query(next: string) {
			const text = next;
			if (text === query) return;
			query = text;
			onquerychange?.(text, { bond });
		}
	};

	const bond = PopupBond.mount('combobox', bondProps);
	useMenuRoot(bond);
	SelectContext.share(bond);
	ComboboxContext.share(bond);
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});

	export const getBond = () => bond;
</script>

{@render children?.({ combobox: bond })}
