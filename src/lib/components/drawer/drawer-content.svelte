<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { DrawerBond } from './bond.svelte';
	const PART = Kernel.plan(DrawerBond, 'content', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import type { SlideoverContentProps } from './types';
	import { animateDrawerContent, type DrawerSide } from './motion.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: SlideoverContentProps<E, B> & { side?: DrawerSide } & BasePropsOf<B> = $props();

	const defaults = {
		animate: animateDrawerContent({}),
		initial: animateDrawerContent({ duration: 0 })
	};

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const bond = part.bond;
	const isOpen = $derived(bond.props.open);

	// Driver-only `animate` motion routes straight to HtmlElement.
	const el = Kernel.element(
		{ atom: part.atom, bond, preset: part.preset, presetLayer: part.presetLayer },
		() => ({
			class: [
				'bg-card text-foreground border-border pointer-events-none absolute',
				isOpen && 'pointer-events-auto',
				'$preset',
				klass
			],
			defaults,
			...restProps
		})
	);
</script>

{@render Kernel.render(el)(el, drawerBody)}

{#snippet drawerBody()}
	<PortalHost>
		{@render children?.({ drawer: bond })}
	</PortalHost>
{/snippet}
