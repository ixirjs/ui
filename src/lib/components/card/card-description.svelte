<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import type { CardDescriptionProps } from './types';
	import { CardBond } from './bond.svelte';

	let {
		class: klass = '',
		preset = undefined,
		as = 'p' as E,
		children = undefined,
		...restProps
	}: CardDescriptionProps<E, B> = $props();

	const part = usePart(CardBond, 'description', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
</script>

<HtmlAtom
	{...restProps}
	{as}
	{part}
	class={['card-description border-border text-sm text-gray-500', '$preset', klass]}
>
	{@render children?.()}
</HtmlAtom>
