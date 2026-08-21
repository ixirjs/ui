<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { TabBond } from './bond.svelte';
	const PART = Kernel.plan(TabBond, 'body', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import type { Snippet } from 'svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { TabsBond } from '$ixirjs/ui/components/tabs/bond.svelte';
	import type { TabBodyProps } from '$ixirjs/ui/components/tabs/types';
	import { Stack } from '$ixirjs/ui/components/stack';

	let {
		class: klass = '',
		children,
		preset = undefined,
		...restProps
	}: TabBodyProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), {
		context: 'required',
		rest: () => restProps
	});
	const tabBond = part.bond;
	const tabsBond = TabsBond.get();
	const value = $derived(tabBond.props.value);

	// Register synchronously, like TabRoot's `bond.mount()`, so `Tabs.Content` has this tab's
	// content during SSR too — `$effect.pre` never runs server-side, so registering only inside
	// it left every panel's body empty until hydration (`value` is this instance's keyed identity
	// and never changes post-mount, so a one-time registration is exactly as live as the effect
	// version was).
	// svelte-ignore state_referenced_locally
	if (value && tabBond && tabsBond) {
		tabsBond.registerTabContent(value, {
			render: body,
			props: {
				children
			}
		});
	}

	$effect.pre(() => {
		return () => {
			if (value && tabsBond) tabsBond.unregisterTabContent(value);
		};
	});
</script>

<!-- Content is teleported to Tabs.Content; nothing rendered here. -->

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
