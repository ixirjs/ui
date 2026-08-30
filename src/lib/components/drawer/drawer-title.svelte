<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { DrawerContext } from './bond.svelte';
	import type { SlideoverTitleProps } from './types';

	const props: SlideoverTitleProps = $props();
	const bond = DrawerContext.getOrThrow('<Drawer.Title /> must be used within a <Drawer.Root />');
	// Announced at init so the root's `aria-labelledby` resolves without a registry.
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, 'drawer-title');
	const id = claimed.id;
	$effect(() => claimed.release);
	const detach = bond.attachPart('title', id);
	$effect(() => detach);
	const el = Kernel.element(() => props, {
		preset: 'drawer.title',
		class: '',
		state: bond,
		layer: () => bond.props.presets?.title,
		attrs: () => ({ id, role: 'heading', 'aria-level': 2 })
	});
</script>

<h3 {...el.attrs}>{@render props.children?.({ drawer: bond })}</h3>
