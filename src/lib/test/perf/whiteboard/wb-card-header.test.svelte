<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './wb-card.svelte';

	let {
		children = undefined,
		...rest
	}: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
	const el = Kernel.element(() => rest, {
		preset: 'card.header',
		class: 'card-header border-border flex flex-col space-y-1.5 px-4 py-4',
		state: CardContext.get()
	});
</script>

<div {...el.attrs}>{@render children?.()}</div>
