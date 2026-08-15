<script lang="ts">
	import type { Component } from 'svelte';

	// Keyed by slug, globbed rather than listed. The previous version imported all 38 previews by
	// hand into a map keyed on *display name* ('Context Menu', 'HtmlElement'), which made it a fifth
	// copy of the component list and one keyed on the least stable field — renaming a page's title
	// silently dropped its preview. `previews/<slug>.svelte` is the whole convention now.
	const previews = import.meta.glob<{ default: Component }>('./previews/*.svelte', {
		eager: true
	});

	let { name }: { name: string } = $props();

	const Preview = $derived(previews[`./previews/${name}.svelte`]?.default);
</script>

{#if Preview}
	<Preview />
{/if}
