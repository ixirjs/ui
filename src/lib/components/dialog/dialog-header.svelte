<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { DialogContext } from './bond.svelte';
	import type { DialogHeaderProps } from './types';

	const props: DialogHeaderProps = $props();
	const bond = DialogContext.getOrThrow('<Dialog.Header /> must be used within a <Dialog.Root />');
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, `${bond.name}-header`);
	const id = claimed.id;
	$effect(() => claimed.release);
	const el = Kernel.element(() => props, {
		preset: `${bond.name}.header` as PresetModuleName,
		class: 'flex w-full px-4 text-xl',
		state: bond,
		layer: () => bond.props.presets?.header,
		attrs: () => ({ id, role: 'banner' })
	});
</script>

<div {...el.attrs}>{@render props.children?.({ dialog: bond })}</div>
