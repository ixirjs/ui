<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { DataGridBond } from './bond.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { DataGridBodyAtom } from './bond.svelte';
	import type { DatagridBodyProps } from './types';
	import { tick } from 'svelte';

	const bond = DataGridBond.get() as DataGridBond<T> | undefined;

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridBodyProps<T, E, B> = $props();

	const atom = createAtomInstance<DataGridBodyAtom, DataGridBond<T>>('body', {
		bond,
		factory: (owner) => new DataGridBodyAtom(owner as DataGridBond<T>)
	});
	const bodyProps = $derived(mergeAtomProps(atom, preset, restProps));

	// Gate rows until columns have flushed to the derived template; otherwise subgrid rows collapse to the `auto` fallback for one tick.
	let isTemplateReady = $state(false);

	tick().then(() => {
		isTemplateReady = true;
	});

	const content = $derived(isTemplateReady ? children : undefined);
</script>

<HtmlAtom {bond} class={['contents', '$preset', klass]} {...bodyProps}>
	{@render content?.({ datagrid: bond })}
</HtmlAtom>
