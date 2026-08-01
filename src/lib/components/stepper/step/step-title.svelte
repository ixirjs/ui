<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom as Atom, type Base } from '$svelte-atoms/core/components/atom';
	import { StepBond } from './bond.svelte';
	import type { StepTitleProps } from './types';

	const bond = StepBond.get();

	if(!bond) {
		throw new Error('StepTitle must be used within a Step component.');
	}

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepTitleProps<E, B> = $props();


	const atom = bond.atom('title');

	const titleProps = $derived({
		preset: preset ?? atom.preset,
		...atom?.spread,
		...restProps
	});
</script>

<Atom
	as="div"
	class={['font-medium text-sm', '$preset', klass]}
	{...titleProps}
>
	{@render children?.({ step: bond })}
</Atom>
