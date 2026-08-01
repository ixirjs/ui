<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'h2', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond } from './bond.svelte';
	import type { DialogTitleProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'h3' as E,
		children = undefined,
		...restProps
	}: DialogTitleProps<E, B> = $props();

	const bond = DialogBond.get();

	const atom = bond?.title();

	const titleProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});
</script>

<HtmlAtom
	{as}
	{bond}
	class={['border-border', '$preset', klass]}
	{...titleProps}
>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
