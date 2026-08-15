<script lang="ts">
	// Nesting cost-attribution fixture: `n` units, each a chain of `depth` nested levels ending in a
	// leaf. Every arm carries the SAME prop payload through a different seam — a component boundary
	// against a cross-file module snippet — so their delta is that seam's cost per level.
	//
	// The `{#each}`, the `{#if}` recursion base case, the leaf and the local body snippet are
	// deliberately identical in every arm: shared plumbing cancels out of a difference, and what
	// remains is the seam. The arm is selected through a ternary callee (one dynamic-callee anchor,
	// paid once per unit by EVERY arm) rather than an `{#if}` at the top, for the same reason.
	//
	// Four arms, a 2×2 over (seam) × (calling convention) — see `types.ts` for why one axis was not
	// enough. `componentChain`/`snippetChain` pass the four facts one by one; `spreadChain` and
	// `packetChain` pass the identical object through `{...data}` and through a single snippet
	// argument respectively. Compare down a column for the seam, across a row for the convention.
	import Level from './nesting-level.svelte';
	import { level, levelPacket } from './nesting-levels.svelte';
	import type { NestingArm } from './types';

	let {
		n = 100,
		arm = 'component',
		depth = 8,
		// The BROAD prop: rendered by every level. Mutating it invalidates the whole chain.
		tint = 't0',
		// The TARGETED prop: drilled through every level, rendered only by the leaf. Mutating it
		// should cost one effect per unit regardless of depth — that is the claim under test.
		deep = 0
	}: { n?: number; arm?: NestingArm; depth?: number; tint?: string; deep?: number } = $props();
</script>

{#each { length: n } as _, i (i)}
	{@render (arm === 'snippet'
		? snippetChain
		: arm === 'snippet-packet'
			? packetChain
			: arm === 'component-spread'
				? spreadChain
				: componentChain)(depth, i, deep)}
{/each}

{#snippet componentChain(d: number, i: number, drilled: number)}
	{#if d === 0}
		{@render leaf(i, drilled)}
	{:else}
		<Level depth={d} label={`L${d}-${i}`} {tint} deep={drilled}>
			{#snippet children(next: number)}
				{@render componentChain(d - 1, i, next)}
			{/snippet}
		</Level>
	{/if}
{/snippet}

{#snippet spreadChain(d: number, i: number, drilled: number)}
	{#if d === 0}
		{@render leaf(i, drilled)}
	{:else}
		{@const data = { depth: d, label: `L${d}-${i}`, tint, deep: drilled }}
		<Level {...data}>
			{#snippet children(next: number)}
				{@render spreadChain(d - 1, i, next)}
			{/snippet}
		</Level>
	{/if}
{/snippet}

{#snippet snippetChain(d: number, i: number, drilled: number)}
	{#if d === 0}
		{@render leaf(i, drilled)}
	{:else}
		{@render level(d, `L${d}-${i}`, tint, drilled, body)}

		{#snippet body(next: number)}
			{@render snippetChain(d - 1, i, next)}
		{/snippet}
	{/if}
{/snippet}

{#snippet packetChain(d: number, i: number, drilled: number)}
	{#if d === 0}
		{@render leaf(i, drilled)}
	{:else}
		{@const data = { depth: d, label: `L${d}-${i}`, tint, deep: drilled }}
		{@render levelPacket(data, body)}

		{#snippet body(next: number)}
			{@render packetChain(d - 1, i, next)}
		{/snippet}
	{/if}
{/snippet}

{#snippet leaf(i: number, drilled: number)}
	<span class="leaf">leaf {i}:{drilled}</span>
{/snippet}
