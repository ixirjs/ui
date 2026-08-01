<script lang="ts">
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import AccessibilityInfo from './accessibility-info.svelte';
	import { list } from '$docs/md/template';

	let {
		features,
		title = undefined
	}: {
		features: string[];
		title?: string | undefined;
	} = $props();

	const mode = getDocMode();
</script>

{#if mode === 'html'}
	<AccessibilityInfo {features} {title} />
{:else}
	{#if title}
		**{title}**
	{/if}
	{list(features)}
{/if}
