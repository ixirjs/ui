<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { Stack } from '$ixirjs/ui/components/stack';
	import { TabsContext } from '$ixirjs/ui/components/tabs/bond.svelte';
	import { TabContext } from './bond.svelte';
	import type { TabBodyProps } from '$ixirjs/ui/components/tabs/types';

	let { class: klass = '', preset = undefined, children, ...restProps }: TabBodyProps = $props();
	const tabBond = TabContext.getOrThrow('<Tab.Body /> must be used within a <Tab.Root />');
	const tabsBond = TabsContext.get();
	const value = $derived(tabBond.props.value);

	// The rendered panel hands the header its id (a consumer id wins on the element and is
	// followed) for as long as `Tabs.Content` renders it.
	const panelKey = createAttachmentKey();
	const panel = (node: HTMLElement) => {
		tabBond.panelId = node.id;
		return () => (tabBond.panelId = undefined);
	};

	// Register synchronously, like TabRoot's `bond.mount()`, so `Tabs.Content` has this tab's
	// content during SSR too — `$effect.pre` never runs server-side, so registering only inside
	// it left every panel's body empty until hydration (`value` is this instance's keyed identity
	// and never changes post-mount, so a one-time registration is exactly as live as the effect
	// version was).
	// svelte-ignore state_referenced_locally
	if (value && tabsBond) {
		tabsBond.registerTabContent(value, { render: body, props: { children } });
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
	class: contentClass = undefined,
	...props
}: {
	children?: Snippet<[Record<string, unknown>]>;
	selected?: boolean;
	class?: string;
	[key: string]: unknown;
} = {})}
	<Stack.Item
		class={[
			'tab-body pointer-events-none flex h-auto w-full min-w-full flex-1 flex-col',
			selected && 'pointer-events-auto',
			klass,
			contentClass
		]}
		{value}
		preset={preset ?? 'tab.body'}
		inert={selected ? undefined : true}
		id={tabBond.bodyId}
		role="tabpanel"
		aria-labelledby={tabBond.headerId}
		hidden={selected ? undefined : true}
		tabindex={selected ? 0 : -1}
		data-active={tabBond.isActive}
		{...restProps}
		{...props}
		{...{ [panelKey]: panel }}
	>
		{@render children?.({ tab: tabBond, ...(tabsBond ? { tabs: tabsBond } : {}) })}
	</Stack.Item>
{/snippet}
