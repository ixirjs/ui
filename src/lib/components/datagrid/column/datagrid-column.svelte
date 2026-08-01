<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { useRoot } from '@ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { DataGridColumnBond } from './bond.svelte';
	import type { DatagridColumnProps } from '$ixirjs/ui/components/datagrid/types';
	import type { Direction } from '$ixirjs/ui/types';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
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
	}: DatagridColumnProps<T, E, B> = $props();

	const root = useRoot(
		DataGridColumnBond,
		{
			id: () => id,
			width: () => width,
			sortable: () => sortable,
			hidden: () => hidden,
			// Two-way: the sort capability commits the toggled direction back through this cell, and
			// `bond.asc()` / `bond.desc()` write it too. As a read-only getter both threw.
			direction: [() => direction, (v: Direction | undefined) => (direction = v ?? 'asc')]
		},
		{ preset: () => preset, factory: () => factory as never }
	);
	const bond = root.bond as DataGridColumnBond<T>;

	const isSortable = $derived(bond.isSortable);

	// The sort capability owns the toggle, so the committed state arrives here rather than being
	// computed at the click site. `direction` is written before this runs.
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

	// Both handlers run before the capability's (the seam composes consumer-first), so they stage
	// the activation and let the capability perform the toggle. A consumer calling preventDefault
	// stops the capability's handler outright, which is how sort cancellation still works.
	function handleClick(event: MouseEvent) {
		const onClick = onclick as ((event: MouseEvent) => void) | undefined;
		onClick?.(event);
		if (event.defaultPrevented || !isSortable) return;
		bond.beginSort(event, 'click');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.defaultPrevented || !isSortable) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		bond.beginSort(event, 'keyboard');
	}

	const el = usePartElement(root, () => ({
		...restProps,
		class: [
			'flex cursor-pointer py-1 font-medium select-none',
			!!sortable && 'sortable',
			'$preset',
			klass
		],
		onclick: handleClick,
		onkeydown: handleKeydown
	}));
</script>

{#if !hidden}
	{#snippet body()}
		{@render children?.({ column: bond })}
	{/snippet}

	{@render partElement(el, body)}
{/if}
