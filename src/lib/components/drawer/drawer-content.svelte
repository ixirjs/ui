<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import type { Motion } from '$ixirjs/ui/preset';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { focusContentOnMount } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { DrawerContext } from './bond.svelte';
	import type { SlideoverContentProps } from './types';
	import { animateDrawerContent, type DrawerSide } from './motion.svelte';

	let {
		as = undefined,
		base = undefined,
		motion = undefined,
		children = undefined,
		...restProps
	}: SlideoverContentProps<E, B> & { side?: DrawerSide } & BasePropsOf<B> = $props();

	const bond = DrawerContext.getOrThrow('<Drawer.Content /> must be used within a <Drawer.Root />');
	const id =
		untrack(() => restProps.id as string | undefined) ?? Kernel.id(bond.id, 'drawer-content');
	const detach = bond.attachPart('content', id);
	$effect(() => detach);

	const defaults = {
		animate: animateDrawerContent({}),
		initial: animateDrawerContent({ duration: 0 })
	};

	// A driver, not a transition: the panel slides on every open/close, so this part dispatches.
	// The open-state class rides the consumer layer, after the preset, where `beforePreset` used to
	// put it before — no shipped preset touches `pointer-events`.
	const el = Kernel.element(
		() => ({ ...restProps, class: [bond.isOpen && 'pointer-events-auto', restProps.class] }),
		{
			preset: 'drawer.content',
			class: 'bg-card text-foreground border-border pointer-events-none absolute',
			state: bond,
			as: () => as,
			base: () => base,
			layer: () => bond.props.presets?.content,
			motion: () => (motion as Motion<never> | undefined) ?? defaults,
			attrs: () => ({
				id,
				role: 'document',
				onmount: (node: HTMLElement) => focusContentOnMount(bond, node)
			})
		}
	);
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block,
	// no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, drawerBody)}

{#snippet drawerBody()}
	<PortalHost>
		{@render children?.({ drawer: bond })}
	</PortalHost>
{/snippet}
