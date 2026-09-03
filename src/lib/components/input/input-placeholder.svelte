<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { RenderProps } from '$ixirjs/ui/authoring';
	import { InputContext } from './bond.svelte';

	let {
		as = undefined,
		base = undefined,
		initial = undefined,
		enter = undefined,
		exit = undefined,
		animate = undefined,
		children = undefined,
		...restProps
	}: RenderProps<'div'> = $props();

	// Optional context: a bare <Input.Placeholder> renders without a root and is simply shown.
	const bond = InputContext.get();
	const el = Kernel.element(() => restProps, {
		preset: 'input.placeholder',
		class:
			'text-muted-foreground pointer-events-none absolute inset-0 flex h-full w-full items-center px-2 leading-1 outline-none',
		state: bond,
		as: () => as,
		base: () => base,
		motion: () =>
			initial || enter || exit || animate ? { initial, enter, exit, animate } : undefined,
		// The real control carries the accessible name; this is a purely visual stand-in and would
		// otherwise be announced as stray text beside it. A consumer attribute still wins.
		attrs: () => ({ 'aria-hidden': 'true', ...(bond ? { id: bond.placeholderId } : {}) })
	});
	const shouldShowPlaceholder = $derived(bond?.shouldShowPlaceholder ?? true);
	const leaf = Kernel.render(el);
</script>

{@render (shouldShowPlaceholder ? placeholder : undefined)?.()}

{#snippet placeholder()}
	{@render leaf(el, children)}
{/snippet}
