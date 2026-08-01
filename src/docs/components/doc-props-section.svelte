<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import { newLine } from '$docs/md/template';

	let {
		title,
		presetKey,
		children
	}: {
		// Sub-section heading, e.g. "Accordion.Root"
		title: string;
		// Preset key shown as a secondary label, e.g. "accordion.item"
		presetKey?: string;
		children: Snippet;
	} = $props();

	const mode = getDocMode();
</script>

{#if mode === 'html'}
	<div class="mt-8 first:mt-0">
		<div class="mb-3 flex items-baseline gap-3">
			<h3 class="text-foreground text-lg font-semibold">{title}</h3>
			{#if presetKey}
				<span class="text-muted-foreground font-mono text-xs"
					>preset: <code class="bg-muted rounded px-1 py-0.5">{presetKey}</code></span
				>
			{/if}
		</div>
		{@render children()}
	</div>
{:else}
	{newLine(2)}### {title}
	{#if presetKey}
		**Preset Key:** `{presetKey}`
	{/if}
	{newLine()}{@render children()}
{/if}
