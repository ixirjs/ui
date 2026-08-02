import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Ablation from '$ixirjs/ui/test/perf/ablation.test.svelte';
import DatagridAblation from '$ixirjs/ui/test/perf/datagrid-ablation.test.svelte';
import PresetAblation from '$ixirjs/ui/test/perf/preset-ablation.test.svelte';

/**
 * Hydration-anchor budget — the DOM-mass ratchet.
 *
 * Every Svelte block, dynamic-callee `{@render}`, `<svelte:element>`, and `$props.id()` emits
 * hydration comment anchors during SSR, and those comments persist as live DOM nodes after
 * hydration. At grid scale they dominated the node count (93 comments/row against an element
 * count of ~11/row) and with it hydration walk time, keyed-teardown time, and heap — see
 * docs/research/hydration-anchor-diet-2026-08.md for the measured per-construct cost model.
 *
 * This spec pins the MARGINAL number of comment nodes per rendered unit, computed as the slope
 * between two instance counts so page-level anchors cancel. It is exact and machine-independent —
 * unlike µs budgets it cannot flap with thermal drift. A change here means the template plumbing
 * of a seam changed shape: read the diff of the rendered markup before accepting a higher number.
 */
function marginalComments(
	component: unknown,
	props: (n: number) => Record<string, unknown>
): number {
	const LOW = 4;
	const HIGH = 12;
	const count = (n: number) =>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(render(component as any, { props: props(n) }).body.match(/<!--/g) ?? []).length;
	return (count(HIGH) - count(LOW)) / (HIGH - LOW);
}

describe('hydration-anchor budget (comments per rendered unit)', () => {
	it('card (Root + Header/Title + Body)', () => {
		expect(marginalComments(Ablation, (n) => ({ n, layer: 'card' }))).toBe(24);
	});

	it('card with defaultPreset installed', () => {
		expect(marginalComments(PresetAblation, (n) => ({ n }))).toBe(22);
	});

	it('collapsible (stateful compound)', () => {
		expect(marginalComments(Ablation, (n) => ({ n, layer: 'collapsible' }))).toBe(17);
	});

	it('datagrid row (Bond row + three cells)', () => {
		expect(marginalComments(DatagridAblation, (n) => ({ n }))).toBe(20);
	});

	// The library-free control: if this moves, Svelte's own anchor emission changed (compiler
	// upgrade) and every budget above needs re-reading, not just re-pinning.
	it('plain hand-written card (control)', () => {
		expect(marginalComments(Ablation, (n) => ({ n, layer: 'plain' }))).toBe(2);
	});
});
