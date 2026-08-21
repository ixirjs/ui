<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { SidebarBond } from './bond.svelte';
	const PART = Kernel.plan(SidebarBond, 'content', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { animateSidebarContent } from './motion.svelte';
	import type { SidebarContentProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: SidebarContentProps<E, B> & BasePropsOf<B> = $props();

	const defaults = {
		animate: animateSidebarContent({ '0': '0px', '1': 'auto' }),
		initial: animateSidebarContent({ '0': '0px', '1': 'auto', duration: 0 })
	};

	const part = Kernel.node(PART, () => ({ preset }), {
		context: 'required',
		rest: () => restProps
	});
</script>

<PortalHost
	bond={part.bond}
	class={['bg-card max-h-screen overflow-visible', '$preset', klass]}
	{defaults}
	{...part.props}
>
	{@render children?.({ sidebar: part.bond })}
</PortalHost>
