<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { Snippet } from 'svelte';
	import { mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { TabBodyAtom, TabBond } from './bond.svelte';
	import { TabsBond } from '../bond.svelte';
	import type { TabBodyProps } from '../types';
	import { Stack } from '../../stack';

	const tabBond = TabBond.getOrThrow('TabBody must be used within a Tab');
	const tabsBond = TabsBond.get();

	let {
		class: klass = '',
		children,
		preset = undefined,
		...restProps
	}: TabBodyProps<E, B> = $props();

	const atom = createAtomInstance<TabBodyAtom, TabBond, HTMLElement>('body', {
		bond: tabBond,
		factory: (owner) => new TabBodyAtom(owner as TabBond)
	});

	const contentProps = $derived(mergeAtomProps(atom, preset, restProps));

	const value = $derived(tabBond?.props.value);

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
		{...contentProps}
		{...props}
	>
		{@render children?.({
			...(tabBond ? { tab: tabBond } : {}),
			...(tabsBond ? { tabs: tabsBond } : {})
		})}
	</Stack.Item>
{/snippet}

<!-- Content is teleported to Tabs.Content; nothing rendered here. -->
