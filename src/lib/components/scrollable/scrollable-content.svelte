<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { ScrollableContentProps } from './types';
	import { ScrollableBond } from './bond.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	const bond = ScrollableBond.getOrThrow('ScrollableContent must be used within a ScrollableRoot');

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: ScrollableContentProps<E, B> = $props();

	const atom = createAtomInstance('content', {
		bond,
		factory: (owner) => owner!.content()
	});

	const contentProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	as="div"
	class={['scrollable-content border-border h-full max-h-full', '$preset', klass]}
	{...contentProps}
>
	{#if children}
		{@render children()}
	{/if}
</HtmlAtom>
