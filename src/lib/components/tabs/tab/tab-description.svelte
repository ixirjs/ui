<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import type { TabDescriptionProps } from '../types';
	import { HtmlAtom as Atom, type Base } from '$svelte-atoms/core/components/atom';
	import { TabBond } from './bond.svelte';

	const bond = TabBond.get();

	if(!bond) {
		throw new Error('TabDescription must be used within a Tab component.');
	}

	let {
		class: klass = '',
		preset = undefined,
		as = 'p' as E,
		children,
		...restProps
	}: TabDescriptionProps<E, B> = $props();

	const atom = bond.atom('description');

	const descriptionProps = $derived({
		preset: preset ?? atom.preset,
		...atom?.spread,
		...restProps
	});
</script>

<Atom
	{bond}
	{as}
	class={['border-border', '$preset', klass]}
	{...descriptionProps}
>
	{@render children?.({ tab: bond })}
</Atom>
