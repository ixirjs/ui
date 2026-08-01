<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { Stack } from '$ixirjs/ui/components/stack';
	import { TabsBond } from './bond.svelte';
	import type { TabsBodyProps } from './types';

	let {
		class: klass = '',
		as = 'div' as E,
		children,
		preset = undefined,
		...restProps
	}: TabsBodyProps<E, B> = $props();

	const part = usePart(TabsBond, 'body', () => restProps, {
		preset: () => preset
	});
	const value = $derived(part.bond.props.value);
</script>

<Stack.Root
	{value}
	bond={part.bond}
	{as}
	class={['tabs-body relative flex-1 flex flex-col', '$preset', klass]}
	{...part.props}
>
	{@render children?.({ tabs: part.bond })}
</Stack.Root>
