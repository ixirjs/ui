<script lang="ts">
	// Ceiling spike: how much of a card's SSR cost could a conditional fast path inside each part
	// actually remove? Every arm renders the SAME card, with `defaultPreset` installed the way an
	// application installs it, so the delta between arms is machinery and nothing else.
	//
	// `fast` keeps the four component boundaries — `<Card.Header>` is the public API, so a
	// conditional dispatch would live INSIDE the part, not replace it — and keeps the template
	// shape, so it is comparable anchor-for-anchor. What it drops is Bond, Atom, registration,
	// capabilities and the presentation snapshot.
	//
	// `card-root` prices the global `<Root>` context separately; no other fixture wraps the card.
	import { Card } from '$ixirjs/ui/components/card';
	import { Root } from '$ixirjs/ui/components/root';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	import FastRoot from './fast-root.test.svelte';
	import FastHeader from './fast-header.test.svelte';
	import FastTitle from './fast-title.test.svelte';
	import FastBody from './fast-body.test.svelte';

	export type CeilingArm = 'card' | 'card-root' | 'fast' | 'fast-root' | 'plain';

	let { n = 100, arm = 'card' }: { n?: number; arm?: CeilingArm } = $props();

	setPreset(defaultPreset);
</script>

{#if arm === 'card'}
	{@render cards()}
{:else if arm === 'fast'}
	{@render fastCards()}
{:else if arm === 'plain'}
	{@render plainCards()}
{:else if arm === 'card-root'}
	<Root>{@render cards()}</Root>
{:else}
	<Root>{@render fastCards()}</Root>
{/if}

{#snippet cards()}
	{#each { length: n } as _, i (i)}
		<Card.Root>
			<Card.Header><Card.Title>Title {i}</Card.Title></Card.Header>
			<Card.Body>Body {i}</Card.Body>
		</Card.Root>
	{/each}
{/snippet}

{#snippet fastCards()}
	{#each { length: n } as _, i (i)}
		<FastRoot>
			<FastHeader><FastTitle>Title {i}</FastTitle></FastHeader>
			<FastBody>Body {i}</FastBody>
		</FastRoot>
	{/each}
{/snippet}

<!-- The library-free floor: the same markup, hand-written, no seed, no preset lookup. -->
{#snippet plainCards()}
	{#each { length: n } as _, i (i)}
		<div class="card">
			<div class="card-header"><h3 class="card-title">Title {i}</h3></div>
			<div class="card-content">Body {i}</div>
		</div>
	{/each}
{/snippet}
