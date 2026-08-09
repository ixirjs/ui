<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { TabsBond } from './bond.svelte';
	const PART = Kernel.part(TabsBond, 'body', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { Stack } from '$ixirjs/ui/components/stack';
	import type { TabsBodyProps } from './types';

	let {
		class: klass = '',
		as = 'div' as E,
		children,
		preset = undefined,
		...restProps
	}: TabsBodyProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), {
		context: 'required',
		rest: () => restProps
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
