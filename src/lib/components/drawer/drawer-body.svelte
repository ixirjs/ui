<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { DrawerContext } from './bond.svelte';
	import type { DrawerBodyProps } from './types';

	const props: DrawerBodyProps = $props();
	const bond = DrawerContext.getOrThrow('<Drawer.Body /> must be used within a <Drawer.Root />');
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, 'drawer-body');
	const id = claimed.id;
	$effect(() => claimed.release);
	const el = Kernel.element(() => props, {
		preset: 'drawer.body',
		class: '',
		state: bond,
		layer: () => bond.props.presets?.body,
		attrs: () => ({ id, role: 'region' })
	});
</script>

<div {...el.attrs}>{@render props.children?.({ drawer: bond })}</div>
