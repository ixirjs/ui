<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { CardBond } from './bond.svelte';
	import type { CardFooterProps } from './types';

	const bond = CardBond.get();

	let {
		class: klass = '',
		preset = undefined,
		as = 'div' as E,
		children = undefined,
		...restProps
	}: CardFooterProps<E, B> = $props();

	const footerProps = $derived(
		mergePresetProps(preset, 'card.footer', { ...bond?.footer(), ...restProps })
	);
</script>

<HtmlAtom
	{as}
	{bond}
	class={['card-footer border-border flex items-center gap-2 px-4 pb-4', '$preset', klass]}
	{...footerProps}
>
	{@render children?.()}
</HtmlAtom>
