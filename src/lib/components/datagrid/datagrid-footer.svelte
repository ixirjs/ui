<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { DataGridBond } from './bond.svelte';
	const PART = Kernel.plan(DataGridBond, 'footer', { class: '' });
</script>

<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { DatagridFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridFooterProps<T, E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), {
		context: 'required',
		message: 'DataGrid.Footer must be used within DataGrid.Root.'
	});
	const bond = part.bond as DataGridBond<T>;

	// Class order is preset, consumer, then the structural `contents`.
	const el = Kernel.element(part, () => ({
		class: ['$preset', klass, 'contents'],
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { datagrid: bond })}
