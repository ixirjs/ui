<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { useRoot } from '@ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { DataGridColumnBond, type DataGridColumnBondProps } from './bond.svelte';
	import type { DatagridColumnProps, SortBy } from '$ixirjs/ui/components/datagrid/types';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		id = ID,
		width = '1fr',
		direction = 'asc',
		hidden = false,
		sortable = undefined,
		factory = defaultFactory,
		children = undefined,
		onclick = undefined,
		onsort = undefined,
		...restProps
	}: DatagridColumnProps<T, E, B> = $props();

	const root = useRoot(
		DataGridColumnBond,
		{
			id: () => id,
			width: () => width,
			sortable: () => sortable,
			hidden: () => hidden,
			direction: () => direction
		},
		{ preset: () => preset, factory: (props) => factory(props as DataGridColumnBondProps) }
	);
	const bond = root.bond as DataGridColumnBond<T>;

	const isSortable = $derived(bond.isSortable);
	const unmount = bond.mount();

	$effect(() => unmount);

	function defaultFactory(props: DataGridColumnBondProps): DataGridColumnBond<T> {
		return DataGridColumnBond.create<T>(props);
	}

	function handleClick(event: MouseEvent) {
		const onClick = onclick as ((event: MouseEvent) => void) | undefined;
		onClick?.(event);
		if (event.defaultPrevented || !isSortable) return;

		direction = direction === 'asc' ? 'desc' : 'asc';

		const sort: SortBy = {
			id: bond.id,
			direction,
			...(typeof sortable === 'string' ? { by: sortable } : {})
		};
		onsort?.(sort, { bond, event, reason: 'click' });
	}
</script>

{#if !hidden}
	<HtmlAtom
		{...restProps}
		part={root}
		class={[
			'flex cursor-pointer py-1 font-medium select-none',
			!!sortable && 'sortable',
			'$preset',
			klass
		]}
		onclick={handleClick}
	>
		{@render children?.({ column: bond })}
	</HtmlAtom>
{/if}
