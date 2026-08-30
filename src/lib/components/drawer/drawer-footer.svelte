<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { DrawerContext } from './bond.svelte';
	import type { SlideoverFooterProps } from './types';

	const props: SlideoverFooterProps = $props();
	const bond = DrawerContext.getOrThrow('<Drawer.Footer /> must be used within a <Drawer.Root />');
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, 'drawer-footer');
	const id = claimed.id;
	$effect(() => claimed.release);
	const el = Kernel.element(() => props, {
		preset: 'drawer.footer',
		class: '',
		state: bond,
		layer: () => bond.props.presets?.footer,
		attrs: () => ({ id, role: 'contentinfo' })
	});
</script>

<div {...el.attrs}>{@render props.children?.({ drawer: bond })}</div>
