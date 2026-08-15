<script lang="ts">
	// Production SSR fixtures. Each layer is gated against its own history; fingerprints make their
	// different output shapes explicit rather than pretending cross-layer timings are equivalent.
	import { Card } from '$ixirjs/ui/components/card';
	import { Collapsible } from '$ixirjs/ui/components/collapsible';

	export type AblationLayer = 'plain' | 'cardroot' | 'card' | 'collapsible';

	let { n = 100, layer = 'plain' }: { n?: number; layer?: AblationLayer } = $props();

	const ROOT = 'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm';
	const HEADER = 'card-header border-border flex flex-col space-y-1.5 px-4 py-4';
	const TITLE = 'card-title border-border text-lg leading-none font-semibold tracking-tight';
	const BODY = 'card-body px-4 py-4';
</script>

{#each { length: n } as _, i (i)}
	{@render (layer === 'plain'
		? plain
		: layer === 'cardroot'
			? cardRoot
			: layer === 'card'
				? card
				: collapsible)(i)}
{/each}

{#snippet plain(i: number)}
	<div class={ROOT}>
		<div class={HEADER}><h3 class={TITLE}>Title {i}</h3></div>
		<div class={BODY}>Body {i}</div>
	</div>
{/snippet}

{#snippet cardRoot(i: number)}
	<Card.Root>Body {i}</Card.Root>
{/snippet}

{#snippet card(i: number)}
	<Card.Root>
		<Card.Header><Card.Title>Title {i}</Card.Title></Card.Header>
		<Card.Body>Body {i}</Card.Body>
	</Card.Root>
{/snippet}

{#snippet collapsible(i: number)}
	<Collapsible.Root>
		<Collapsible.Header>Title {i}</Collapsible.Header>
		<Collapsible.Body>Body {i}</Collapsible.Body>
	</Collapsible.Root>
{/snippet}
