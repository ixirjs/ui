<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { Overlay } from '$svelte-atoms/core/components/overlay';
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

	const atom = bond.atom('content');

	const contentProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<Overlay
	{bond}
	class={['bg-card border-border', 'max-h-screen overflow-visible', '$preset', klass]}
	{fallback}
	{...contentProps}
>
		{@render children?.({ sidebar: bond })}
</Overlay>
