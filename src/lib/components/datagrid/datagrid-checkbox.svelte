<script lang="ts">
	import { Checkbox } from '$ixirjs/ui/components/checkbox';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { DataGridBond } from './bond.svelte';
	import { DataGridRowBond } from './row/bond.svelte';
	import type { DatagridCheckboxProps } from './types';

	const datagridRowBond = DataGridRowBond.get();
	// The row Bond already holds the grid it resolved; fall back to context only when this checkbox
	// is rendered outside a row, where there is no row Bond to ask.
	const datagridBond = datagridRowBond?.datagrid ?? DataGridBond.get();

	let {
		class: klass = '',
		preset = undefined,
		value = undefined,
		checked = $bindable(false),
		onclick = undefined,
		oninput = undefined,
		onchange = undefined,
		...restProps
	}: DatagridCheckboxProps = $props();

	const checkboxProps = $derived(mergePresetProps(preset, 'datagrid.checkbox', restProps));

	const isHeader = $derived(datagridRowBond?.isHeader ?? false);
	const rowId = $derived(datagridRowBond?.id);

	const selectedCount = $derived(datagridBond?.selectedRows.length ?? 0);
	const rowCount = $derived(datagridBond?.rows.size ?? 0);

	const isAllSelected = $derived(rowCount > 0 && selectedCount === rowCount);
	const isHeaderIndeterminate = $derived(selectedCount > 0 && selectedCount < rowCount);

	const isRowSelected = $derived(datagridRowBond?.isSelected ?? false);

	const classNames = $derived(['datagrid-cell-checkbox', '$preset', klass]);

	const activeCheckbox = $derived(isHeader ? headerCheckbox : rowCheckbox);

	function handleCallbacks(ev: Event, checked: boolean) {
		const onInput = oninput as ((event: Event, options: { checked: boolean }) => void) | undefined;
		const onChange = onchange as
			| ((event: Event, options: { checked: boolean }) => void)
			| undefined;
		onInput?.(ev, { checked });
		onChange?.(ev, { checked });
	}

	function handleHeaderChange(ev: Event | undefined = undefined) {
		const checked = !isAllSelected;
		// Fresh event for the cancellation protocol: incoming `ev` is already `defaultPrevented` by the Checkbox's label-forwarding guard, so it would reflect the checkbox's internals, not the consumer's intent.
		const currentEvent = new Event(ev?.type ?? 'input');
		handleCallbacks(currentEvent, checked);
		if (currentEvent.defaultPrevented) return;

		const allIds = [...(datagridBond?.rows.keys ?? [])];

		const context = ev ? { event: ev } : undefined;
		if (checked === true) {
			datagridBond?.select(allIds, context);
		} else {
			datagridBond?.unselect(allIds, context);
		}
	}

	function handleRowChange(ev: Event | undefined = undefined) {
		const checked = !isRowSelected;
		// Fresh event — incoming `ev` is already `defaultPrevented`; see `handleHeaderChange`.
		const currentEvent = new Event(ev?.type ?? 'input');
		handleCallbacks(currentEvent, checked);
		if (currentEvent.defaultPrevented || !rowId) return;

		const context = ev ? { event: ev } : undefined;
		if (checked) {
			datagridRowBond?.select(context);
		} else {
			datagridRowBond?.unselect(context);
		}
	}
</script>

{@render activeCheckbox()}

{#snippet headerCheckbox()}
	<Checkbox
		{...value !== undefined ? { value: value as string } : {}}
		{...onclick ? { onclick: onclick as (ev?: Event) => void } : {}}
		bond={datagridRowBond}
		class={classNames}
		checked={isAllSelected}
		indeterminate={isHeaderIndeterminate}
		oninput={handleHeaderChange}
		{...checkboxProps}
	/>
{/snippet}

{#snippet rowCheckbox()}
	<Checkbox
		{...value !== undefined ? { value: value as string } : {}}
		{...onclick ? { onclick: onclick as (ev?: Event) => void } : {}}
		bond={datagridRowBond}
		class={classNames}
		checked={isRowSelected}
		oninput={handleRowChange}
		{...checkboxProps}
	/>
{/snippet}
