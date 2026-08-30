<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { ToastContext } from './bond.svelte';
	import type { ToastDescriptionProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: ToastDescriptionProps = $props();
	const bond = ToastContext.getOrThrow(
		'<Toast.Description /> must be used within a <Toast.Root />'
	);
	// The part hands the root its id at init — the live region's labelling without a registry.
	const id = Kernel.id(bond.id, 'toast-description');
	bond.descriptionId = id;

	const el = Kernel.element(() => restProps, {
		preset: 'toast.description',
		class: 'border-border',
		state: bond,
		as: () => as ?? 'p',
		base: () => base,
		attrs: () => ({ id })
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { toast: bond })}
