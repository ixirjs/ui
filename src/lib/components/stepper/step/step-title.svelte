<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
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
</script>

<HtmlAtom as="div" class={['font-medium text-sm', '$preset', klass]} {...restProps} {part}>
	{@render children?.({ step: part.bond })}
</HtmlAtom>
