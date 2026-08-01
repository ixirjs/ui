<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom as Atom, type Base } from '$svelte-atoms/core/components/atom';
	import { TabsBond } from './bond.svelte';
	import type { TabsHeaderProps } from './types';

	const bond = TabsBond.get();

	if(!bond) {
		throw new Error('TabsHeader must be used within a Tabs component');
	}

	let {
		class: klass = '',
		children,
		preset = undefined,
		...restProps
	}: TabsHeaderProps<E, B> = $props();

	const atom = bond.atom('header');

	const headerProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});
</script>

<Atom
	{bond}
	class={['relative flex min-w-full', '$preset', klass]}
	{...headerProps}
>
	{@render children?.({ tabs: bond })}
</Atom>
