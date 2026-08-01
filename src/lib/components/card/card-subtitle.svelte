<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { CardBond } from './bond.svelte';
	import type { CardSubtitleProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'p' as E,
		children = undefined,
		...restProps
	}: CardSubtitleProps<E, B> = $props();

	const part = usePart(CardBond, 'subtitle', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
</script>

<HtmlAtom
	{...restProps}
	{as}
	{part}
	class={['card-subtitle border-border text-sm font-medium text-gray-600', '$preset', klass]}
>
	{@render children?.()}
</HtmlAtom>
