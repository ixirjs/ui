<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { PortalHost } from '$svelte-atoms/core/components/portal/host';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { SidebarBond } from './bond.svelte';
	import { animateSidebarContent } from './motion.svelte';
	import type { SidebarRootProps } from './types';

	const bond = SidebarBond.getOrThrow('<Sidebar.Content /> must be used within a <Sidebar.Root />');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		fallback = {
			animate: animateSidebarContent({ '0': '0px', '1': 'auto' }),
			initial: animateSidebarContent({ '0': '0px', '1': 'auto', duration: 0 })
		},
		...restProps
	}: SidebarRootProps<E, B> = $props();

	const atom = createAtomInstance('content', {
		bond,
		factory: (owner) => owner!.content()
	});

	const contentProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<PortalHost
	{bond}
	class={['bg-card max-h-screen overflow-visible', '$preset', klass]}
	{fallback}
	{...contentProps}
>
	{@render children?.({ sidebar: bond })}
</PortalHost>
