<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './wb-card.svelte';

	let {
		children = undefined,
		...rest
	}: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
	const el = Kernel.element(() => rest, {
		preset: 'card.content',
		class: 'card-content border-border px-4 pb-4',
		state: CardContext.get()
	});
</script>

<div {...el.attrs}>{@render children?.()}</div>
