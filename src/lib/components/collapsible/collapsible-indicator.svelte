<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { animate as motion } from 'motion';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import IconArrowDown from '$svelte-atoms/core/icons/icon-arrow-down.svelte';
	import { CollapsibleBond } from './bond.svelte';
	import type { CollapsibleIndicatorProps } from './types';

	const bond = CollapsibleBond.get();
	const isOpen = $derived(bond?.state.props.open ?? false);

	let {
		class: klass = '',
		preset = undefined,
		animate=defaultAnimate,
		children = undefined,
		...restProps
	}: CollapsibleIndicatorProps<E, B> = $props();
	const atom = bond?.atom('indicator');

	const indicatorProps = $derived(mergeAtomProps(atom, preset, restProps));

	function defaultAnimate(node: HTMLElement) {
		motion(node, { rotate: 180 * +isOpen }, { duration: 0.3, ease: 'anticipate' });
	}
</script>

<HtmlAtom
	{bond}
	{animate}
	class={['border-border flex size-4 items-center justify-center', '$preset', klass]}
	{...indicatorProps}
>
	{#if children}
		{@render children?.({ collapsible: bond })}
	{:else}
		<Icon src={IconArrowDown} />
	{/if}
</HtmlAtom>
