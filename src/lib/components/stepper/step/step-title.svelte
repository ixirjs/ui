<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { StepBond } from './bond.svelte';
	import type { StepTitleProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepTitleProps<E, B> = $props();

	const part = usePart(StepBond, 'title', () => restProps, {
		preset: () => preset
	});

	const el = usePartElement(part, () => ({
		as: 'div',
		class: ['font-medium text-sm', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { step: part.bond })}
