<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { SidebarContext } from './bond.svelte';
	import { animateSidebarContent } from './motion.svelte';
	import type { SidebarContentProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: SidebarContentProps<E, B> & BasePropsOf<B> = $props();

	const bond = SidebarContext.getOrThrow(
		'<Sidebar.Content /> must be used within a <Sidebar.Root />'
	);
	const id =
		untrack(() => restProps.id as string | undefined) ?? Kernel.id(bond.id, 'sidebar-content');
	const detach = bond.attachPart('content', id);
	$effect(() => detach);

	const defaults = {
		animate: animateSidebarContent({ '0': '0px', '1': 'auto' }),
		initial: animateSidebarContent({ '0': '0px', '1': 'auto', duration: 0 })
	};
</script>

<!-- Handed to `PortalHost` — another component — which forwards `defaults`. -->
<PortalHost
	class={['bg-card max-h-screen overflow-visible', '$preset', klass]}
	preset={preset ?? 'sidebar.content'}
	{defaults}
	{id}
	aria-expanded={bond.isOpen}
	aria-disabled={bond.isDisabled}
	{...restProps}
>
	{@render children?.({ sidebar: bond })}
</PortalHost>
