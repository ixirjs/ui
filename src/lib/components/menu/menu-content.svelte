<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Content } from '$svelte-atoms/core/components/popover/atoms';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { MenuBond } from './bond.svelte';
	import { Root } from '../list/atoms';

	const bond = MenuBond.get();

	let {
		class: klass = '',
		as = 'ul' as T,
		base = Root as B,
		preset = undefined,
		children = undefined,
		...restProps
	} = $props();

	const contentProps = $derived({ preset: preset ?? 'menu.content', ...restProps });
</script>

<Content
	{as}
	{base}
	{bond}
	class={['border-border overflow-hidden p-0', '$preset', klass]}
	{...contentProps}
>
	{@render children?.()}
</Content>
