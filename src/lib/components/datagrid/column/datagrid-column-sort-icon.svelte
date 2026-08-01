<script lang="ts" generics="T extends keyof HTMLElementTagNameMap, B extends Base = Base">
	import { animate as motion } from 'motion';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import { DataGridColumnBond } from './bond.svelte.ts';
	import IconArrowDown from '$svelte-atoms/core/icons/icon-arrow-down.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	const bond = DataGridColumnBond.get();

	const isSortable = $derived(bond.state.isSortable);
	const directionAsNumber = $derived(+(bond.state.props.direction === 'asc'));

	let {
		class: klass = '',
		preset = undefined,
		...restProps
	} = $props();

	const sortIconProps = $derived({ preset: preset ?? 'datagrid.column-sort-icon', ...restProps });

	function _animate(node: HTMLElement) {
		motion(
			node,
			{ rotate: directionAsNumber * 180, opacity: isSortable ? 0.7 : 0.2 },
			{ duration: 0.3, ease: 'anticipate' }
		);
	}
</script>

{#if !!isSortable}
	<HtmlAtom
		{bond}
		class={['border-border', '$preset', klass]}
		fallback={{
			animate: _animate,
		}}
		{...sortIconProps}
	>
		<Icon>
			<IconArrowDown />
		</Icon>
	</HtmlAtom>
{/if}
