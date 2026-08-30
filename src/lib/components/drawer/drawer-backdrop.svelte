<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { backdropPress } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { DrawerContext } from './bond.svelte';
	import type { SlideoverBackdropProps } from './types';

	const props: SlideoverBackdropProps = $props();
	const bond = DrawerContext.getOrThrow(
		'<Drawer.Backdrop /> must be used within a <Drawer.Root />'
	);
	const id = untrack(() => props.id) ?? Kernel.id(bond.id, 'drawer-backdrop');
	// A press outside the content closes the drawer (`reason: 'backdrop-press'`); the consumer's
	// `onclick` composes first and can prevent it.
	const el = Kernel.element(() => props, {
		preset: 'drawer.backdrop',
		class: 'border-border absolute inset-0 bg-black/30',
		state: bond,
		layer: () => bond.props.presets?.backdrop,
		attrs: () => ({
			id,
			role: 'presentation',
			'aria-hidden': true,
			onclick: (event: MouseEvent) => backdropPress(bond, event)
		})
	});
</script>

<div {...el.attrs}></div>
