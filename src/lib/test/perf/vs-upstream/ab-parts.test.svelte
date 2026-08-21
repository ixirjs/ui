<script lang="ts">
	// Attribution fixture for the collapsible client-mount inversion: splits the family into root
	// machinery, root+header, and the full part set, so the cost can be pinned to a layer rather
	// than to "collapsible". Consumer API only — it has to compile against both trees.
	import { Collapsible } from '$ixirjs/ui/components/collapsible';

	export type PartsLayer = 'collapsibleroot' | 'collapsiblehead' | 'collapsiblefull';

	let { n = 100, layer = 'collapsibleroot' }: { n?: number; layer?: PartsLayer } = $props();
</script>

{#each { length: n } as _, i (i)}
	{@render (layer === 'collapsibleroot'
		? rootOnly
		: layer === 'collapsiblehead'
			? withHeader
			: full)(i)}
{/each}

{#snippet rootOnly(i: number)}
	<Collapsible.Root>Body {i}</Collapsible.Root>
{/snippet}

{#snippet withHeader(i: number)}
	<Collapsible.Root>
		<Collapsible.Header>Title {i}</Collapsible.Header>
	</Collapsible.Root>
{/snippet}

{#snippet full(i: number)}
	<Collapsible.Root>
		<Collapsible.Header>Title {i}</Collapsible.Header>
		<Collapsible.Body>Body {i}</Collapsible.Body>
	</Collapsible.Root>
{/snippet}
