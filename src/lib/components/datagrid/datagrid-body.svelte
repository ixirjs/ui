<script lang="ts" generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { DataGridBond } from './bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { DatagridBodyProps } from './types';
	import { tick } from 'svelte';

	const bond = (DataGridBond.get() as DataGridBond<T> | undefined);

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridBodyProps<T, E, B> = $props();

	const atom = bond?.atom('body');
	const bodyProps = $derived({ preset: preset ?? atom?.preset, ...atom?.spread, ...restProps });

	// Defer rendering rows until the grid template has been computed from the
	// registered columns. Without this gate, the body renders on the same tick
	// the root sets `--template-columns`, before the columns mounted in the
	// header have flushed to the derived `template`. The parent grid then
	// briefly resolves to the `auto` fallback (one column) and rows with
	// `grid-template-columns: subgrid` collapse into a single column, causing a
	// layout shift once the real template is applied.
	let isTemplateReady = $state(false);

	tick().then(() => {
		isTemplateReady = true;
	});

	const content = $derived(isTemplateReady ? children : undefined);
</script>

<HtmlAtom
	{bond}
	class={['contents', '$preset', klass]}
	{...bodyProps}
>
	{@render content?.({ datagrid: bond })}
</HtmlAtom>
