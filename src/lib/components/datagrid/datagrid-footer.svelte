<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '@ixirjs/ui/shared';
	import { DataGridBond } from './bond.svelte';
	import type { DatagridFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DatagridFooterProps<T, E, B> = $props();

	const part = usePart(DataGridBond, 'footer', () => restProps, {
		message: 'DataGrid.Footer must be used within DataGrid.Root.',
		preset: () => preset
	});
	const bond = part.bond as DataGridBond<T>;

	// The explicit `bond` prop HtmlAtom took is exactly `part.bond`, which the seam already carries.
	// Class order is this part's own: preset first, then consumer, then the structural `contents`.
	const el = usePartElement(part, () => ({
		class: ['$preset', klass, 'contents'],
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ datagrid: bond })}
{/snippet}

{@render partElement(el, body)}
