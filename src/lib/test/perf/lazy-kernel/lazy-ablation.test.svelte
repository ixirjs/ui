<script lang="ts">
	import { Card } from '$ixirjs/ui/components/card';
	import { Root } from '$ixirjs/ui/components/root';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	import FastRoot from '$ixirjs/ui/test/perf/ceiling/fast-root.test.svelte';
	import FastHeader from '$ixirjs/ui/test/perf/ceiling/fast-header.test.svelte';
	import FastTitle from '$ixirjs/ui/test/perf/ceiling/fast-title.test.svelte';
	import FastBody from '$ixirjs/ui/test/perf/ceiling/fast-body.test.svelte';
	import LazyRoot from './lazy-root.test.svelte';
	import LazyHeader from './lazy-header.test.svelte';
	import LazyTitle from './lazy-title.test.svelte';
	import LazyBody from './lazy-body.test.svelte';

	export type LazyArm = 'current' | 'ceiling' | 'lazy';
	let { n = 100, arm = 'current' }: { n?: number; arm?: LazyArm } = $props();
	setPreset(defaultPreset);
</script>

<Root
	>{@render (arm === 'current' ? currentCards : arm === 'lazy' ? lazyCards : ceilingCards)()}</Root
>

{#snippet currentCards()}
	{#each { length: n } as _, i (i)}
		<Card.Root>
			<Card.Header><Card.Title>Title {i}</Card.Title></Card.Header>
			<Card.Body>Body {i}</Card.Body>
		</Card.Root>
	{/each}
{/snippet}

{#snippet lazyCards()}
	{#each { length: n } as _, i (i)}
		<LazyRoot>
			<LazyHeader><LazyTitle>Title {i}</LazyTitle></LazyHeader>
			<LazyBody>Body {i}</LazyBody>
		</LazyRoot>
	{/each}
{/snippet}

{#snippet ceilingCards()}
	{#each { length: n } as _, i (i)}
		<FastRoot>
			<FastHeader><FastTitle>Title {i}</FastTitle></FastHeader>
			<FastBody>Body {i}</FastBody>
		</FastRoot>
	{/each}
{/snippet}
