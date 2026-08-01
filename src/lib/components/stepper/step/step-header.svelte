<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { StepBond, StepHeaderAtom } from './bond.svelte';
	import type { StepHeaderProps } from './types';

	const bond = StepBond.getOrThrow('StepHeader must be used within a Step component.');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepHeaderProps<E, B> = $props();

	const atom = createAtomInstance<StepHeaderAtom, StepBond>('header', {
		bond,
		factory: (owner) => new StepHeaderAtom(owner as StepBond)
	});

	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	as="div"
	{bond}
	class={['font-medium text-sm flex flex-col', '$preset', klass]}
	{...headerProps}
>
	{@render children?.({ step: bond })}
</HtmlAtom>
