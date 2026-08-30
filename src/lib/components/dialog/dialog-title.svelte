<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { DialogContext } from './bond.svelte';
	import type { DialogTitleProps } from './types';

	const props: DialogTitleProps = $props();
	const bond = DialogContext.getOrThrow('<Dialog.Title /> must be used within a <Dialog.Root />');
	// Announced at init so the root's `aria-labelledby` resolves without a registry.
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, `${bond.name}-title`);
	const id = claimed.id;
	$effect(() => claimed.release);
	const detach = bond.attachPart('title', id);
	$effect(() => detach);
	const el = Kernel.element(() => props, {
		preset: `${bond.name}.title` as PresetModuleName,
		class: '',
		state: bond,
		layer: () => bond.props.presets?.title,
		attrs: () => ({ id, role: 'heading', 'aria-level': 2 })
	});
</script>

<h3 {...el.attrs}>{@render props.children?.({ dialog: bond })}</h3>
