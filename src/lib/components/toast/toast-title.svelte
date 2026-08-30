<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { ToastContext } from './bond.svelte';
	import type { ToastTitleProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: ToastTitleProps = $props();
	const bond = ToastContext.getOrThrow('<Toast.Title /> must be used within a <Toast.Root />');
	// The part hands the root its id at init — the live region's labelling without a registry.
	const id = Kernel.id(bond.id, 'toast-title');
	bond.titleId = id;

	const el = Kernel.element(() => restProps, {
		preset: 'toast.title',
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
