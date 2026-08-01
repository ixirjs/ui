<script lang="ts" generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DataGridBond, DataGridBondState, type DataGridStateProps } from './bond.svelte';
	import type { DatagridRootProps } from './types';
	import './datagrid.css';

	let {
		class: klass = '',
		preset = undefined,
		values = $bindable([]),
		template = undefined,
		fallbackTemplate = 'auto',
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: DatagridRootProps<T, E, B> = $props();

	const binding = bindBond<DataGridBond<T>>(
		(props) => factory(props),
		{
			template: () => template,
			values: [() => values, (v) => (values = v ?? [])]
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	function defaultFactory(props: DataGridStateProps<T>) {
		const state = new DataGridBondState<T>(props);
		return new DataGridBond<T>(state);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['datagrid-root w-full gap-x-0 gap-y-0', '$preset', klass]}
	style="--template-columns:{bond.state.template || fallbackTemplate}"
	{...binding.props}
	{...restProps}
>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
