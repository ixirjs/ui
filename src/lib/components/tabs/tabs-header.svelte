<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { TabsBond, TabsHeaderAtom } from './bond.svelte';
	import type { TabsHeaderProps } from './types';

	const bond = TabsBond.getOrThrow('TabsHeader must be used within a Tabs component');

	let {
		class: klass = '',
		children,
		preset = undefined,
		...restProps
	}: TabsHeaderProps<E, B> = $props();

	const atom = createAtomInstance<TabsHeaderAtom, TabsBond>('header', {
		bond,
		factory: (owner) => new TabsHeaderAtom(owner as TabsBond)
	});

	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {bond} class={['relative flex min-w-full', '$preset', klass]} {...headerProps}>
	{@render children?.({ tabs: bond })}
</HtmlAtom>
