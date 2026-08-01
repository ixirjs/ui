<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { CardBond } from './bond.svelte';
	import type { CardHeaderProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'div' as E,
		children = undefined,
		...restProps
	}: CardHeaderProps<E, B> = $props();

	const part = usePart(CardBond, 'header', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
</script>

<HtmlAtom
	{...restProps}
	{as}
	{part}
	class={['card-header border-border flex flex-col space-y-1.5 px-4 py-4', '$preset', klass]}
>
	{@render children?.()}
</HtmlAtom>
