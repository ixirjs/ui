<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { Stack } from '../stack';
	import { TabsBond } from './bond.svelte';
	import type { TabsBodyProps } from './types';

	const bond = TabsBond.get();
	const value = $derived(bond?.state.props.value);

	if (!bond) {
		throw new Error('Tabs.Body must be used within a Tabs.Root component.');
	}

	let {
		class: klass = '',
		as = 'div' as E,
		children,
		preset = undefined,
		...restProps
	}: TabsBodyProps<E, B> = $props();

	const atom = bond.atom('body');

	const bodyProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});
</script>

<Stack.Root
	value={value}
	{bond}
	{as}
	class={['tabs-body relative flex-1 flex flex-col', '$preset', klass]}
	{...bodyProps}
>
	{@render children?.({ tabs: bond })}
</Stack.Root>