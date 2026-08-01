<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { animate as motion } from 'motion';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import IconArrowDown from '$svelte-atoms/core/icons/icon-arrow-down.svelte';
	import { CollapsibleBond, CollapsibleIndicatorAtom } from './bond.svelte';
	import type { CollapsibleIndicatorProps } from './types';

	const bond = CollapsibleBond.getOrThrow(
		'<Collapsible.Indicator /> must be used within a <Collapsible.Root />'
	);
	const isOpen = $derived(bond?.state.props.open ?? false);

	let {
		class: klass = '',
		preset = undefined,
		animate = defaultAnimate,
		children = undefined,
		...restProps
	}: CollapsibleIndicatorProps<E, B> = $props();
	const atom = createAtomInstance<CollapsibleIndicatorAtom, CollapsibleBond>('indicator', {
		bond,
		required: true,
		factory: (owner) => new CollapsibleIndicatorAtom(owner as CollapsibleBond)
	});

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
