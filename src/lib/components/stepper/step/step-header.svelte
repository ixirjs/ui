<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { StepBond } from './bond.svelte';
	import type { StepHeaderProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepHeaderProps<E, B> = $props();

	const part = usePart(StepBond, 'header', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom
	as="div"
	class={['font-medium text-sm flex flex-col', '$preset', klass]}
	{...restProps}
	{part}
>
	{@render children?.({ step: part.bond })}
</HtmlAtom>
