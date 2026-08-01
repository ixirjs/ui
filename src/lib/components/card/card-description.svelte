<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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
	const el = usePartElement(part, () => ({
		as,
		class: ['card-description border-border text-sm text-gray-500', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children)}
