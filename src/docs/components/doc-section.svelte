<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import * as Section from '$docs/components/section/atoms';
	import { newLine } from '$docs/md/template';

	let {
		title,
		subtitle = undefined,
		children
	}: {
		title: string;
		subtitle?: string;
		children: Snippet;
	} = $props();

	const mode = getDocMode();
</script>

{#if mode === 'html'}
	<Section.Root>
		<Section.Header>
			<Section.Title>{title}</Section.Title>
			{#if subtitle}<Section.Subtitle>{subtitle}</Section.Subtitle>{/if}
		</Section.Header>
		{@render children()}
	</Section.Root>
{:else}
	{newLine(2)}## {title}
	{#if subtitle}
		{newLine()}_{subtitle}_
	{/if}
	{newLine()}{@render children()}
{/if}
