<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { ScrollableContentProps } from './types';
	import { ScrollableBond } from './bond.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: ScrollableContentProps<E, B> = $props();

	const part = usePart(ScrollableBond, 'content', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom
	as="div"
	class={['scrollable-content border-border h-full max-h-full', '$preset', klass]}
	{...restProps}
	{part}
>
	{#if children}
		{@render children()}
	{/if}
</HtmlAtom>
