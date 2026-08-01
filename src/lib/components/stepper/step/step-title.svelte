<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom as Atom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepBond } from './bond.svelte';
	import type { StepTitleProps } from './types';

	const bond = StepBond.getOrThrow('StepTitle must be used within a Step component.');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepTitleProps<E, B> = $props();


	const atom = bond.atom('title');

	const titleProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<Atom
	as="div"
	class={['font-medium text-sm', '$preset', klass]}
	{...titleProps}
>
	{@render children?.({ step: bond })}
</Atom>
