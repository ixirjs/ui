<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { StepBond } from './bond.svelte';
	import type { StepDescriptionProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'p',
		children = undefined,
		...restProps
	}: StepDescriptionProps<E, B> = $props();

	const part = usePart(StepBond, 'description', () => restProps, {
		preset: () => preset
	});

	const el = usePartElement(part, () => ({
		as,
		class: ['text-xs text-muted-foreground', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { step: part.bond })}
