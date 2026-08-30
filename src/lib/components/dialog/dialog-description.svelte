<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { DialogContext } from './bond.svelte';
	import type { DialogDescriptionProps } from './types';

	const props: DialogDescriptionProps = $props();
	const bond = DialogContext.getOrThrow(
		'<Dialog.Description /> must be used within a <Dialog.Root />'
	);
	// Announced at init so the root's `aria-describedby` resolves without a registry.
	// A repeatable part: two of these under one root would otherwise render the same id.
	// The first keeps the canonical one; the slot is released when this instance goes away.
	const claimed = untrack(() => props.id)
		? { id: untrack(() => props.id) as string, release: () => undefined }
		: Kernel.claimId(bond, bond.id, `${bond.name}-description`);
	const id = claimed.id;
	$effect(() => claimed.release);
	const detach = bond.attachPart('description', id);
	$effect(() => detach);
	const el = Kernel.element(() => props, {
		preset: `${bond.name}.description` as PresetModuleName,
		class: '',
		state: bond,
		layer: () => bond.props.presets?.description,
		attrs: () => ({ id })
	});
</script>

<p {...el.attrs}>{@render props.children?.({ dialog: bond })}</p>
