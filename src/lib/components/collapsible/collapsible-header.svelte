<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { CollapsibleHeaderProps } from './types';
	import { CollapsibleBond } from './bond.svelte';

	const bond = CollapsibleBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: CollapsibleHeaderProps<E, B> = $props();

	const atom = bond?.atom('header');

	const collapsibleProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{bond}
	class={['border-border flex cursor-pointer items-center gap-2', '$preset', klass]}
	{...collapsibleProps}
>
	{@render children?.({ collapsible: bond })}
</HtmlAtom>
