<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { Snippet } from 'svelte';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { TabBond } from './bond.svelte';
	import { TabsBond } from '$ixirjs/ui/components/tabs/bond.svelte';
	import type { TabBodyProps } from '$ixirjs/ui/components/tabs/types';
	import { Stack } from '$ixirjs/ui/components/stack';

	let {
		class: klass = '',
		children,
		preset = undefined,
		...restProps
	}: TabBodyProps<E, B> = $props();

	const part = usePart(TabBond, 'body', () => restProps, {
		preset: () => preset
	});
	const tabBond = part.bond;
	const tabsBond = TabsBond.get();
	const value = $derived(tabBond.props.value);

	// Register content snippet with tabs while mounted.
	$effect.pre(() => {
		if (!value) return;
		if (!tabBond) return;
		if (!tabsBond) return;

		tabsBond.registerTabContent(value, {
			render: body,
			props: {
				children
			}
		});

		return () => {
			tabsBond.unregisterTabContent(value);
		};
	});
</script>

{#snippet body({
	children = undefined,
	selected = false,
	...props
}: {
	children?: Snippet<[Record<string, unknown>]>;
	selected?: boolean;
	[key: string]: unknown;
} = {})}
	<Stack.Item
		class={[
			'tab-body pointer-events-none flex h-auto w-full min-w-full flex-1 flex-col',
			selected && 'pointer-events-auto',
			'$preset',
			klass
		]}
		{value}
		inert={selected ? undefined : true}
		{...part.props}
		{...props}
	>
		{@render children?.({
			...(tabBond ? { tab: tabBond } : {}),
			...(tabsBond ? { tabs: tabsBond } : {})
		})}
	</Stack.Item>
{/snippet}

<!-- Content is teleported to Tabs.Content; nothing rendered here. -->
