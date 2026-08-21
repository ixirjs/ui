<script lang="ts">
	/**
	 * Lane A/B fixture.
	 *
	 * Both arms render the identical tree — one Card.Root wrapping one `card.title` part — and differ
	 * only in which Kernel lane resolves the title:
	 *
	 *   node    `Card.Title`  → Kernel.part + Kernel.node → class-only lane (plan.defaultClass)
	 *   element `LaneTitle`   → definePart               → full presentation, per part, per render
	 *
	 * One title per card because `title` is a single-node part; the registry rejects a second one.
	 * The surround is one Card.Root, identical in both arms, so the slope difference between arms is
	 * one part's lane cost and nothing else. `lane-bench.ts` asserts byte equality before it times.
	 */
	import { Card } from '$ixirjs/ui/components/card';
	import { Root } from '$ixirjs/ui/components/root';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	import LaneTitle from './lane-title.test.svelte';
	import CardTitle from '$ixirjs/ui/components/card/card-title.svelte';
	import LaneInlinePlan from './lane-inline-plan.test.svelte';

	export type LaneArm = 'node' | 'element' | 'escalated' | 'direct' | 'inlinePlan';
	let { n = 100, arm = 'node' }: { n?: number; arm?: LaneArm } = $props();
	setPreset(defaultPreset);
</script>

<Root>
	{@render (arm === 'node'
		? nodeCards
		: arm === 'element'
			? elementCards
			: arm === 'direct'
				? directCards
				: arm === 'inlinePlan'
					? inlinePlanCards
					: escalatedCards)()}
</Root>

{#snippet nodeCards()}
	{#each { length: n } as _, i (i)}
		<Card.Root><Card.Title>Title {i}</Card.Title></Card.Root>
	{/each}
{/snippet}

{#snippet elementCards()}
	{#each { length: n } as _, i (i)}
		<Card.Root><LaneTitle>Title {i}</LaneTitle></Card.Root>
	{/each}
{/snippet}

<!-- The SAME `Card.Title` as the node arm, handed one rich prop so `KernelNode.prepare()` returns
     true and `Kernel.render` selects `richBranch` — which mounts `RichPart`, materializes the slot's
     Atom, and resolves the full presentation from inside a fresh component boundary.

     `defaults={{}}` is the cheapest possible escalator: it is in PRESENTATION_PROP_NAMES so a defined
     value forces the rich lane, and with no `variants` declared it resolves to nothing, so the arm
     still emits byte-identical output. That is the point — this measures the cost of the BRIDGE, not
     the cost of extra presentation the consumer asked for. Written inline rather than behind a
     wrapper component so the arm delta stays one part's lane cost. -->
{#snippet escalatedCards()}
	{#each { length: n } as _, i (i)}
		<Card.Root><Card.Title defaults={{}}>Title {i}</Card.Title></Card.Root>
	{/each}
{/snippet}

<!-- Control for the namespace access itself: the same `card.title` part on the same node lane,
     reached through a direct component import instead of `Card.Title`. A member-expression component
     is a DYNAMIC component to the compiler, and its SSR output carries a fragment boundary the plain
     identifier form does not — so this arm separates that cost from any lane cost. -->
{#snippet directCards()}
	{#each { length: n } as _, i (i)}
		<Card.Root><CardTitle>Title {i}</CardTitle></Card.Root>
	{/each}
{/snippet}

<!-- Bisect: same node lane, same plain import, plan resolved per instance instead of once. -->
{#snippet inlinePlanCards()}
	{#each { length: n } as _, i (i)}
		<Card.Root><LaneInlinePlan>Title {i}</LaneInlinePlan></Card.Root>
	{/each}
{/snippet}
