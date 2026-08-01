<script lang="ts">
	// SSR cost-attribution fixture. Every layer renders the SAME four-element card structure through
	// a different amount of machinery, so the delta between two layers is that layer's cost.
	import { HtmlAtom } from '$ixirjs/ui/components/atom';
	import { Card } from '$ixirjs/ui/components/card';
	import { Collapsible } from '$ixirjs/ui/components/collapsible';

	export type AblationLayer = 'plain' | 'htmlatom' | 'card' | 'collapsible';

	let { n = 100, layer = 'plain' }: { n?: number; layer?: AblationLayer } = $props();

	const ROOT = 'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm';
	const HEADER = 'card-header border-border flex flex-col space-y-1.5 px-4 py-4';
	const TITLE = 'card-title border-border text-lg leading-none font-semibold tracking-tight';
	const BODY = 'card-body px-4 py-4';
</script>

{#each { length: n } as _, i (i)}
	{#if layer === 'plain'}
		<!-- Library-free control: the same markup written by hand. -->
		<div class={ROOT}>
			<div class={HEADER}><h3 class={TITLE}>Title {i}</h3></div>
			<div class={BODY}>Body {i}</div>
		</div>
	{:else if layer === 'htmlatom'}
		<!-- Presentation pipeline only: no Bond, no Atom, no usePart. -->
		<HtmlAtom class={[ROOT]}>
			<HtmlAtom class={[HEADER]}>
				<HtmlAtom as="h3" class={[TITLE]}>Title {i}</HtmlAtom>
			</HtmlAtom>
			<HtmlAtom class={[BODY]}>Body {i}</HtmlAtom>
		</HtmlAtom>
	{:else if layer === 'card'}
		<!-- The full compound: Bond, registered Atoms, part context, preset layers. -->
		<Card.Root>
			<Card.Header><Card.Title>Title {i}</Card.Title></Card.Header>
			<Card.Body>Body {i}</Card.Body>
		</Card.Root>
	{:else}
		<!-- A stateful compound whose parts carry capabilities and cross-part ARIA. -->
		<Collapsible.Root>
			<Collapsible.Header>Title {i}</Collapsible.Header>
			<Collapsible.Body>Body {i}</Collapsible.Body>
		</Collapsible.Root>
	{/if}
{/each}
