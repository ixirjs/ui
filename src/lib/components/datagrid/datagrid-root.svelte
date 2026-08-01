<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { controlledProp, useRoot } from '@ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { DataGridBond, type DataGridBondProps } from './bond.svelte';
	import type { DatagridRootProps } from './types';
	import './datagrid.css';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		values = $bindable([]),
		template = undefined,
		fallbackTemplate = 'auto',
		factory = defaultFactory,
		onvalueschange = undefined,
		children = undefined,
		...restProps
	}: DatagridRootProps<T, E, B> = $props();

	function sameValues(left: readonly string[], right: readonly string[]) {
		return left.length === right.length && left.every((item, index) => item === right[index]);
	}

	const valuesProp = controlledProp<string[] | undefined, DataGridBond<T>>({
		get: () => values,
		set: (next) => (values = next ?? []),
		equals: (left, right) => sameValues(left ?? [], right ?? []),
		onchange: (next, context) => onvalueschange?.(next ?? [], context),
		context: (bond) => bond.takeValuesChangeContext()
	});

	const root = useRoot(
		DataGridBond,
		{
			template: () => template,
			values: valuesProp
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: (props) => factory(props as DataGridBondProps<T>)
		}
	);
	const bond = root.bond as DataGridBond<T>;
	function defaultFactory(props: DataGridBondProps<T>) {
		return DataGridBond.create<T>(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	{...restProps}
	part={root}
	class={['datagrid-root w-full gap-x-0 gap-y-0', '$preset', klass]}
	style="--template-columns:{bond.template || fallbackTemplate}"
>
	{@render children?.({ datagrid: bond })}
</HtmlAtom>
