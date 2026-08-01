<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { CardBond } from './bond.svelte';
	import type { CardMediaProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'div' as E,
		children = undefined,
		...restProps
	}: CardMediaProps<E, B> = $props();

	const part = usePart(CardBond, 'media', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const el = usePartElement(part, () => ({
		as,
		class: ['card-media border-border overflow-hidden', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children)}
