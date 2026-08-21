<script lang="ts">
	import type { Component } from 'svelte';

	// Keyed by slug, globbed rather than listed. The previous version imported all 38 previews by
	// hand into a map keyed on *display name* ('Context Menu', 'HtmlElement'), which made it a fifth
	// copy of the component list and one keyed on the least stable field — renaming a page's title
	// silently dropped its preview. `previews/<slug>.svelte` is the whole convention now.
	// Absolute glob, as in `registry.ts` — this file lives under `src/docs`, the previews it renders
	// under `src/routes`.
	const previews = import.meta.glob<{ default: Component }>(
		'/src/routes/docs/components/previews/*.svelte',
		{ eager: true }
	);

	let { name }: { name: string } = $props();

	const Preview = $derived(
		previews[`/src/routes/docs/components/previews/${name}.svelte`]?.default
	);
</script>

{#if Preview}
	<Preview />
{:else}
	<!-- Not every component has a preview file yet; an empty cell reads as a broken one. -->
	<span class="text-fg-faint font-mono text-[11px]">{name}</span>
{/if}
