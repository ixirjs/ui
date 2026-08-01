<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import type { TabDescriptionProps } from '../types';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { TabBond, TabDescriptionAtom } from './bond.svelte';

	const bond = TabBond.getOrThrow('TabDescription must be used within a Tab component.');

	let {
		preset = undefined,
		as = 'p' as E,
		children,
		...restProps
	}: TabDescriptionProps<E, B> = $props();

	const atom = createAtomInstance<TabDescriptionAtom, TabBond, HTMLElement>('description', {
		bond,
		factory: (owner) => new TabDescriptionAtom(owner as TabBond)
	});

	const descriptionProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {bond} {as} {...descriptionProps}>
	{@render children?.({ tab: bond })}
</HtmlAtom>
