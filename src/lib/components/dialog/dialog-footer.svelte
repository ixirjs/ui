<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { DialogContext } from './bond.svelte';
	import type { DialogFooterProps } from './types';

	const props: DialogFooterProps = $props();
	const bond = DialogContext.getOrThrow('<Dialog.Footer /> must be used within a <Dialog.Root />');
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, `${bond.name}-footer`);
	const id = claimed.id;
	$effect(() => claimed.release);
	const el = Kernel.element(() => props, {
		preset: `${bond.name}.footer` as PresetModuleName,
		class: 'flex px-4',
		state: bond,
		layer: () => bond.props.presets?.footer,
		attrs: () => ({ id, role: 'contentinfo' })
	});
</script>

<div {...el.attrs}>{@render props.children?.({ dialog: bond })}</div>
