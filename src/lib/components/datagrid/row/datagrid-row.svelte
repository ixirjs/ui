<script lang="ts" generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { untrack } from 'svelte';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DataGridRowBond, DataGridRowBondState, type DataGridRowBondProps } from './bond.svelte';
	import type { DatagridRowProps } from '../types';
    import './datagrid-row.css';

	let {
		class: klass = '',
		preset = undefined,
		value,
		rows = 'auto',
		data = undefined,
		factory = defaultFactory,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DatagridRowProps<T, E, B> = $props();

	const binding = bindBond<DataGridRowBond<T>>(
		(props) => factory(props),
		{
			data: () => data,
			value: () => value
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	const isHeader = $derived(bond.state.isHeader);
	const isSelected = $derived(bond.state.isSelected);

	const unmount = untrack(() => (isHeader ? undefined : bond.mount()));
	$effect(() => unmount);

	function defaultFactory(props: DataGridRowBondProps<T>) {
		const state = new DataGridRowBondState<T>(props);
		return new DataGridRowBond<T>(state);
	}

	function handleClick(ev: Event) {
		onclick?.(ev, { row: bond });
	}
</script>

<HtmlAtom
	class={[
		'datagrid-row items-center border-b bg-transparent',
		!isHeader && 'hover:bg-foreground/2 active:bg-foreground/4 transition-colors duration-100',
		isHeader && 'header-tr',
		isSelected && 'bg-primary/2 hover:bg-primary/4 active:bg-primary/6',
		'$preset',
		klass
	]}
	style="--rows:{rows}"
	onclick={handleClick}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ row: bond })}
</HtmlAtom>
