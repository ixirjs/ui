<script lang="ts" generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import {
		DataGridColumnBond,
		DataGridColumnBondState,
		type DataGridColumnBondProps
	} from './bond.svelte';
	import type { DatagridColumnProps } from '../types';
	
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

	const binding = bindBond<DataGridColumnBond<T>>(
		(props) => factory(props),
		{
			id: () => id,
			width: () => width,
			sortable: () => sortable,
			hidden: () => hidden,
			direction: () => direction
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	const isSortable = $derived(bond.state.isSortable);
	const columnProps = $derived({ ...binding.props, ...bond.state.props, ...restProps });

	const unmount = bond.mount();

	$effect(() => unmount);

	function defaultFactory(props: DataGridColumnBondProps): DataGridColumnBond<T> {
		const bondState = new DataGridColumnBondState(props);
		return new DataGridColumnBond<T>(bondState);
	}

	function onclick_(ev: Event) {
		const onClick = onclick as
			| ((event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) => void)
			| undefined;
		onClick?.(ev as MouseEvent & { currentTarget: EventTarget & HTMLDivElement });

		if (!ev.defaultPrevented) {
			if (!isSortable) {
				return;
			}

			if (isSortable) {
				if (direction === 'asc') {
					direction = 'desc';
				} else {
					direction = 'asc';
				}
			} else {
				if (!(typeof sortable === 'boolean')) {
				}
			}

			if (typeof sortable === 'string') {
				onsort?.(new CustomEvent('sort'), { field: sortable, direction });
			} else {
				onsort?.(new CustomEvent('sort'), { direction });
			}
		}
	}
</script>

{#if !hidden}
	<HtmlAtom
		class={[
			'flex cursor-pointer py-1 font-medium select-none',
			!!sortable && 'sortable',
			'$preset',
			klass
		]}
		onclick={onclick_}
		{...columnProps}
	>
		{@render children?.({ column: bond })}
	</HtmlAtom>
{/if}
