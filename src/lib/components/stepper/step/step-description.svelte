<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { StepBond, StepDescriptionAtom } from './bond.svelte';
	import type { StepDescriptionProps } from './types';

	const bond = StepBond.getOrThrow('StepDescription must be used within a Step component.');

	let {
		class: klass = '',
		preset = undefined,
		as = 'p',
		children = undefined,
		...restProps
	}: StepDescriptionProps<E, B> = $props();

	const atom = createAtomInstance<StepDescriptionAtom, StepBond>('description', {
		bond,
		factory: (owner) => new StepDescriptionAtom(owner as StepBond)
	});

	const descriptionProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {as} class={['text-xs text-muted-foreground', '$preset', klass]} {...descriptionProps}>
	{@render children?.({ step: bond })}
</HtmlAtom>
