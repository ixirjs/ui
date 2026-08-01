<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { DataGridBond, DataGridRootAtom, type DataGridBondProps } from './bond.svelte';
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

	let valuesState = $derived<string[]>(values);

	const binding = bindBond<DataGridBond<T>>(
		(props) => factory(props),
		{
			template: () => template,
			values: [
				() => valuesState,
				(v) => {
					valuesState = v ?? [];
					values = valuesState;
				}
			]
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();
	const rootAtom = createAtomInstance<DataGridRootAtom, DataGridBond<T>>('root', {
		bond,
		factory: (owner) => new DataGridRootAtom(owner as DataGridBond<T>)
	});
	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	function defaultFactory(props: DataGridBondProps<T>) {
		return DataGridBond.create<T>(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['datagrid-root w-full gap-x-0 gap-y-0', '$preset', klass]}
	style="--template-columns:{bond.template || fallbackTemplate}"
	{...rootProps}
>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
