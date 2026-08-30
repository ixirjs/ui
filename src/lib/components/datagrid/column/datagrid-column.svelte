<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { DataGridColumnBond, DataGridColumnContext } from './bond.svelte';
	import type { DatagridColumnProps } from '$ixirjs/ui/components/datagrid/types';

	const ID = $props.id();

	let {
		as = undefined,
		base = undefined,
		id = ID,
		width = '1fr',
		direction = 'asc',
		hidden = false,
		sortable = undefined,
		factory = undefined,
		children = undefined,
		onclick = undefined,
		onsort = undefined,
		...restProps
	}: DatagridColumnProps<T, E, B> & BasePropsOf<B> = $props();

	const bondProps = {
		get id() {
			return id;
		},
		get width() {
			return width;
		},
		get sortable() {
			return sortable;
		},
		get hidden() {
			return hidden;
		},
		get direction() {
			return direction;
		},
		set direction(next) {
			direction = next ?? 'asc';
		}
	};
	const build = untrack(() => factory);
	const bond = DataGridColumnContext.share(
		(build ? build(bondProps) : DataGridColumnBond.create(bondProps)) as DataGridColumnBond
	) as DataGridColumnBond<T>;
	const grid = bond.datagrid;

	bond.onSortCommit = (column) => {
		const activation = column.takeSortActivation();
		onsort?.(
			{
				id: column.id,
				direction: column.props.direction,
				...(typeof sortable === 'string' ? { by: sortable } : {})
			},
			{
				bond,
				event: activation.event as MouseEvent | KeyboardEvent,
				...(activation.reason ? { reason: activation.reason } : {})
			}
		);
	};

	const unmount = bond.mount();
	$effect(() => unmount);

	function handleClick(event: MouseEvent) {
		(onclick as ((event: MouseEvent) => void) | undefined)?.(event);
		if (event.defaultPrevented || !bond.isSortable) return;
		bond.activate(event, 'click');
	}
	function handleKeydown(event: KeyboardEvent) {
		if (event.defaultPrevented || !bond.isSortable) return;
		if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
		event.preventDefault();
		bond.activate(event, 'keyboard');
	}

	const el = Kernel.element(() => restProps, {
		preset: 'datagrid.column',
		class: 'flex cursor-pointer py-1 font-medium select-none',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => {
			const sorted = grid.sort.directionFor(bond.id);
			return {
				id: bond.elementId,
				class: sortable ? 'sortable' : undefined,
				'data-sortable': sortable ? 'true' : undefined,
				'data-direction': direction,
				role: 'columnheader',
				'aria-sort': sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined,
				tabindex: 0,
				'data-sort': sorted,
				'data-sort-field': bond.id,
				'data-sort-priority': sorted ? grid.sort.priority : undefined,
				onclick: handleClick,
				onkeydown: handleKeydown
			};
		}
	});
	const leaf = Kernel.render(el);
</script>

{@render (!hidden ? columnElement : undefined)?.()}

{#snippet columnElement()}
	{@render leaf(el, children, { column: bond })}
{/snippet}
