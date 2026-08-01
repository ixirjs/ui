<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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
	const el = usePartElement(part, () => ({
		as,
		class: ['card-subtitle border-border text-sm font-medium text-gray-600', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children)}
