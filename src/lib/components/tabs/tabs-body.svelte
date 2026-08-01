<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { Stack } from '../stack';
	import { TabsBodyAtom, TabsBond } from './bond.svelte';
	import type { TabsBodyProps } from './types';

	const bond = TabsBond.getOrThrow('Tabs.Body must be used within a Tabs.Root component.');
	const value = $derived(bond.props.value);

	let {
		class: klass = '',
		as = 'div' as E,
		children,
		preset = undefined,
		...restProps
	}: TabsBodyProps<E, B> = $props();

	const atom = createAtomInstance<TabsBodyAtom, TabsBond>('body', {
		bond,
		factory: (owner) => new TabsBodyAtom(owner as TabsBond)
	});

	const bodyProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<Stack.Root
	{value}
	{bond}
	{as}
	class={['tabs-body relative flex-1 flex flex-col', '$preset', klass]}
	{...bodyProps}
>
	{@render children?.({ tabs: bond })}
</Stack.Root>
