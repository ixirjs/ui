<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { ScrollableContext } from './bond.svelte';
	import type { ScrollableContentProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children,
		...restProps
	}: ScrollableContentProps = $props();

	// Inert: it contributes no id, and nothing resolves one.
	const el = Kernel.element(() => restProps, {
		preset: 'scrollable.content',
		class: 'scrollable-content border-border h-full max-h-full',
		state: ScrollableContext,
		as: () => as,
		base: () => base
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
