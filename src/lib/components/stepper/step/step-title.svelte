<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { StepBond, StepTitleAtom } from './bond.svelte';
	import type { StepTitleProps } from './types';

	const bond = StepBond.getOrThrow('StepTitle must be used within a Step component.');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepTitleProps<E, B> = $props();

	const atom = createAtomInstance<StepTitleAtom, StepBond>('title', {
		bond,
		factory: (owner) => new StepTitleAtom(owner as StepBond)
	});

	const titleProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom as="div" class={['font-medium text-sm', '$preset', klass]} {...titleProps}>
	{@render children?.({ step: bond })}
</HtmlAtom>
