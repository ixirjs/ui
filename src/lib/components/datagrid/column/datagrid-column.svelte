<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import {
		DataGridColumnBond,
		DataGridColumnRootAtom,
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
	const rootAtom = createAtomInstance<DataGridColumnRootAtom, DataGridColumnBond<T>>('root', {
		bond,
		factory: (owner) => new DataGridColumnRootAtom(owner as DataGridColumnBond<T>)
	});

	const isSortable = $derived(bond.isSortable);
	const columnProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...bond.props, ...restProps })
	);

	const unmount = bond.mount();

	$effect(() => unmount);

	function defaultFactory(props: DataGridColumnBondProps): DataGridColumnBond<T> {
		return DataGridColumnBond.create<T>(props);
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

			if (direction === 'asc') {
				direction = 'desc';
			} else {
				direction = 'asc';
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
