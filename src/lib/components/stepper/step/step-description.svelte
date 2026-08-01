<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom as Atom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepBond } from './bond.svelte';
	import type { StepDescriptionProps } from './types';

	const bond = StepBond.getOrThrow('StepDescription must be used within a Step component.');

	let {
		class: klass = '',
		preset = undefined,
		as="p",
		children = undefined,
		...restProps
	}: StepDescriptionProps<E, B> = $props();

	const atom = bond.atom('description');

	const descriptionProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<Atom
	{as}
	class={['text-xs text-muted-foreground', '$preset', klass]}
	{...descriptionProps}
>
	{@render children?.({ step: bond })}
</Atom>
