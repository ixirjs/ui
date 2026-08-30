<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { DrawerContext } from './bond.svelte';
	import type { SlideoverHeaderProps } from './types';

	const props: SlideoverHeaderProps = $props();
	const bond = DrawerContext.getOrThrow('<Drawer.Header /> must be used within a <Drawer.Root />');
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, 'drawer-header');
	const id = claimed.id;
	$effect(() => claimed.release);
	const el = Kernel.element(() => props, {
		preset: 'drawer.header',
		class: '',
		state: bond,
		layer: () => bond.props.presets?.header,
		attrs: () => ({ id, role: 'banner' })
	});
</script>

<div {...el.attrs}>{@render props.children?.({ drawer: bond })}</div>
