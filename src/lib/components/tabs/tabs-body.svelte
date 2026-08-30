<script lang="ts">
	import { Stack } from '$ixirjs/ui/components/stack';
	import { TabsContext } from './bond.svelte';
	import type { TabsBodyProps } from './types';

	let {
		class: klass = '',
		as = 'div',
		preset = undefined,
		children,
		...restProps
	}: TabsBodyProps = $props();
	const bond = TabsContext.getOrThrow('<Tabs.Body /> must be used within a <Tabs.Root />');
	const value = $derived(bond.props.value);
</script>

<!-- A Stack of the registered panels: the active one is on top. The tabs body preset resolves
     on the Stack's element in place of `stack.root`. -->
<Stack.Root
	{value}
	{as}
	preset={preset ?? 'tabs.body'}
	presetLayer={bond.props.presets?.body}
	class={['tabs-body relative flex-1 flex flex-col', klass]}
	id={bond.bodyId}
	role="group"
	{...restProps}
>
	{@render children?.({ tabs: bond })}
</Stack.Root>
