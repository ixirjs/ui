<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { CardBond } from './bond.svelte';
	import type { CardFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'div' as E,
		children = undefined,
		...restProps
	}: CardFooterProps<E, B> = $props();

	const part = usePart(CardBond, 'footer', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const el = usePartElement(part, () => ({
		as,
		class: ['card-footer border-border flex items-center gap-2 px-4 pb-4', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children)}
