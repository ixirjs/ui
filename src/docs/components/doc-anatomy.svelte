<script lang="ts">
	// The parts a compound component is made of, from `metadata.componentsSummary`. Markdown mode
	// already listed these; this is the same data with the design's two-column rule between rows.
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import { list } from '$docs/md/template';
	import type { ComponentSummary } from '$docs/types';

	let { parts, intro = undefined }: { parts: ComponentSummary[]; intro?: string | undefined } =
		$props();

	const mode = getDocMode();
</script>

{#if mode === 'html'}
	{#if intro}
		<p class="text-muted-foreground m-0 text-[14.5px] leading-[1.65]">{intro}</p>
	{/if}
	<div class="bg-border border-border flex flex-col gap-px overflow-hidden rounded-[10px] border">
		{#each parts as part (part.name)}
			<div
				class="bg-surface grid grid-cols-[180px_minmax(0,1fr)] gap-4 px-3.5 py-3 max-[640px]:grid-cols-[minmax(0,1fr)]"
			>
				<code class="text-primary font-mono text-[12.5px] break-words">{part.name}</code>
				<span class="text-muted-foreground text-[13px] leading-[1.55]">{part.description}</span>
			</div>
		{/each}
	</div>
{:else}
	{#if intro}
		{intro}
	{/if}
	{list(parts.map((part) => `**${part.name}**: ${part.description}`))}
{/if}
