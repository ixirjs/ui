<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { CardBond } from './bond.svelte';
	import type { CardTitleProps } from './types';

	const bond = CardBond.get();

	let {
		class: klass = '',
		preset = undefined,
		as = 'h3' as E,
		children = undefined,
		...restProps
	}: CardTitleProps<E, B> = $props();

	const titleProps = $derived(
		mergePresetProps(preset, 'card.title', { ...bond?.title(), ...restProps })
	);
</script>

<HtmlAtom
	{as}
	{bond}
	class={[
		'card-title border-border text-lg leading-none font-semibold tracking-tight',
		'$preset',
		klass
	]}
	{...titleProps}
>
	{@render children?.()}
</HtmlAtom>
