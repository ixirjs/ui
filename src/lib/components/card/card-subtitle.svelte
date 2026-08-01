<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { CardBond } from './bond.svelte';
	import type { CardSubtitleProps } from './types';

	const bond = CardBond.get();

	let {
		class: klass = '',
		preset = undefined,
		as = 'p' as E,
		children = undefined,
		...restProps
	}: CardSubtitleProps<E, B> = $props();

	const subtitleProps = $derived(mergePresetProps(preset, 'card.subtitle', { ...bond?.subtitle(), ...restProps }));
</script>

<HtmlAtom
	{as}
	{bond}
	class={['card-subtitle border-border text-sm font-medium text-gray-600', '$preset', klass]}
	{...subtitleProps}
>
	{@render children?.()}
</HtmlAtom>
