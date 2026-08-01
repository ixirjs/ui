<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { untrack } from 'svelte';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { DataGridRowBond, DataGridRowRootAtom, type DataGridRowBondProps } from './bond.svelte';
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
	const rootAtom = createAtomInstance<DataGridRowRootAtom, DataGridRowBond<T>>('root', {
		bond,
		factory: (owner) => new DataGridRowRootAtom(owner as DataGridRowBond<T>)
	});
	const rowProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	const isHeader = $derived(bond.isHeader);
	const isSelected = $derived(bond.isSelected);

	const unmount = untrack(() => (isHeader ? undefined : bond.mount()));
	$effect(() => unmount);

	function defaultFactory(props: DataGridRowBondProps<T>) {
		return DataGridRowBond.create<T>(props);
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
	{...rowProps}
>
	{@render children?.({ row: bond })}
</HtmlAtom>
