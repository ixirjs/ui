<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { ButtonProps } from './types';

	let {
		type = 'button',
		as = 'button',
		base = undefined,
		children = undefined,
		...restProps
	}: ButtonProps = $props();

	// Dispatches rather than writing a literal `<button>`: the docs render it as `<a>` through `as`,
	// and `base` stays available to a consumer. `type` is the part's own attribute, so it beats a
	// preset's `attrs` and a consumer's `type` still wins over it.
	const el = Kernel.element(() => restProps, {
		preset: 'button',
		class:
			'button border-border disabled:bg-muted disabled:text-muted-foreground w-fit cursor-pointer rounded-md px-3 py-2 transition-colors duration-200',
		as: () => as,
		base: () => base,
		attrs: () => ({ type })
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
