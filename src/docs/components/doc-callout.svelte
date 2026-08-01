<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import DocCallout from './callout.svelte';

	let {
		variant = 'info',
		title = undefined,
		children
	}: {
		variant?: 'info' | 'warning' | 'success' | 'tip' | 'note';
		title?: string;
		children: Snippet;
	} = $props();

	const mode = getDocMode();

	const mdPrefix: Record<string, string> = {
		info: '> ℹ️',
		warning: '> ⚠️',
		success: '> ✅',
		tip: '> 💡',
		note: '>'
	};
</script>

{#if mode === 'html'}
	<DocCallout {variant} {title}>
		{@render children()}
	</DocCallout>
{:else}
	{mdPrefix[variant]}{title ? ` **${title}**` : ''}
	> > {@render children()}
{/if}
