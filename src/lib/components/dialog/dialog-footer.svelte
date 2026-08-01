<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond } from './bond.svelte';
	import type { DialogFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogFooterProps<E, B> = $props();

	const bond = DialogBond.get();

	const atom = bond?.footer();

	const footerProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});
</script>

<HtmlAtom
	{bond}
	class={['border-border', 'flex px-4', '$preset', klass]}
	{...footerProps}
>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
