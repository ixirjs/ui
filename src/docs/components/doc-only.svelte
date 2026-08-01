<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getDocMode, type DocMode } from '$docs/context/doc-mode.svelte';

	let {
		for: target = 'both',
		children
	}: {
		// Render mode gate: "html" = browser only, "markdown" = LLM output only, "both" = always (default)
		for?: DocMode | 'both';
		children: Snippet;
	} = $props();

	const mode = getDocMode();
	const visible = $derived(target === 'both' || target === mode);
</script>

{#if visible}
	{@render children()}
{/if}
