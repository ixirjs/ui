<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { DialogContext } from './bond.svelte';
	import type { DialogBodyProps } from './types';

	const props: DialogBodyProps = $props();
	const bond = DialogContext.getOrThrow('<Dialog.Body /> must be used within a <Dialog.Root />');
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, `${bond.name}-body`);
	const id = claimed.id;
	$effect(() => claimed.release);
	const el = Kernel.element(() => props, {
		preset: `${bond.name}.body` as PresetModuleName,
		class: 'px-4 py-2',
		state: bond,
		layer: () => bond.props.presets?.body,
		attrs: () => ({ id, role: 'region', 'aria-live': 'polite' })
	});
</script>

<div {...el.attrs}>{@render props.children?.({ dialog: bond })}</div>
