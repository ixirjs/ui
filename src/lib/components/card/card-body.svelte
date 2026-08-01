<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { CardContentProps } from './types';
	import { CardBond } from './bond.svelte';

	const bond = CardBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: CardContentProps<E, B> = $props();

	const contentProps = $derived(mergePresetProps(preset, 'card.content', { ...bond?.content(), ...restProps }));
</script>

<HtmlAtom
	{bond}
	class={['card-content border-border px-4 pb-4', '$preset', klass]}
	{...contentProps}
>
	{@render children?.()}
</HtmlAtom>
