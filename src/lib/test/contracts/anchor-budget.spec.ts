import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Ablation from '$ixirjs/ui/test/perf/ablation.test.svelte';
import DatagridAblation from '$ixirjs/ui/test/perf/datagrid-ablation.test.svelte';
import PresetAblation from '$ixirjs/ui/test/perf/preset-ablation.test.svelte';
import MenuAblation from '$ixirjs/ui/test/perf/menu-ablation.test.svelte';
import TransitionAnchors from '$ixirjs/ui/test/perf/transition-anchors.test.svelte';
import VirtualTest from '$ixirjs/ui/test/runes/virtual.test.svelte';
import Ceiling from '$ixirjs/ui/test/perf/ceiling/ceiling-ablation.test.svelte';

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
		expect(marginalComments(Ablation, (n) => ({ n, layer: 'card' }))).toBe(20);
	});

	it('card with defaultPreset installed', () => {
		expect(marginalComments(PresetAblation, (n) => ({ n }))).toBe(19);
	});

	it('collapsible (stateful compound)', () => {
		expect(marginalComments(Ablation, (n) => ({ n, layer: 'collapsible' }))).toBe(16);
	});

	it('datagrid row (Bond row + three cells)', () => {
		expect(marginalComments(DatagridAblation, (n) => ({ n }))).toBe(20);
	});

	/**
	 * One menu item — the wrapper-re-skin shape.
	 *
	 * `DropdownMenu.Item` used to mount `List.Item` and forward to it — two component boundaries
	 * where one would do. A boundary itself emits no anchors, but forwarding children through one
	 * does: the component invocation, the implicit `children` snippet handed to it, and the inner
	 * `{@render children?.(arg)}` are three comment nodes a part rendering its own element does not
	 * pay. This budget was 12 through the wrapper and is 9 without it; that difference IS the
	 * wrapper, and it is the number that keeps the wrapper from coming back.
	 */
	it('menu item (Atom + registration, rendering its own element)', () => {
		expect(marginalComments(MenuAblation, (n) => ({ n }))).toBe(9);
	});

	/**
	 * A transitioning element — the half of the render dispatch nothing else here reaches.
	 *
	 * Every other fixture in this file is motionless; `collapsible` and `tree` only look like
	 * exceptions, because they declare motion through a `createAttachmentKey()` symbol and so render
	 * through `divBranch` like the rest. See `transition-anchors.test.svelte` for why that leaves the
	 * four transition leaves and both escalation targets unratcheted.
	 *
	 * Kernel and the retained public HtmlElement renderer share the transition leaves. A number that
	 * rises is a regression; a number that falls should be re-pinned only after reading the markup.
	 */
	it('transitioning element via Kernel', () => {
		expect(marginalComments(TransitionAnchors, (n) => ({ n, arm: 'kernel' }))).toBe(4);
	});

	it('transitioning element via <HtmlElement>', () => {
		expect(marginalComments(TransitionAnchors, (n) => ({ n, arm: 'element' }))).toBe(4);
	});

	// The library-free control: if this moves, Svelte's own anchor emission changed (compiler
	// upgrade) and every budget above needs re-reading, not just re-pinning.
	it('plain hand-written card (control)', () => {
		expect(marginalComments(Ablation, (n) => ({ n, layer: 'plain' }))).toBe(1);
	});

	/**
	 * Production shape: the same card wrapped in `<Root>`.
	 *
	 * Every other budget here renders a bare compound, which no application does — and that gap hid a
	 * real regression for months. A Root-published `renderers.html` slot was tested for truthiness,
	 * so being inside a `<Root>` pushed every part off the native seam onto a second component
	 * boundary: +8 anchors and +23 µs per card, invisible to every gate in this file.
	 * See docs/research/root-renderer-slot-2026-08.md.
	 *
	 * Pinned separately from `card` because it is a different question — not "what does a card cost"
	 * but "what does a card cost the way it actually ships".
	 */
	it('card inside <Root> (production shape)', () => {
		expect(marginalComments(Ceiling, (n) => ({ n, arm: 'card-root' }))).toBe(19);
	});

	// The same markup with each part's machinery stripped to a preset lookup and an id — the floor a
	// conditional fast path could reach. Pinned so the gap between it and the row above stays visible.
	it('card inside <Root>, machinery-free control', () => {
		expect(marginalComments(Ceiling, (n) => ({ n, arm: 'fast-root' }))).toBe(9);
	});
});

/**
 * The virtualization ratchet. A windowed list has no per-source-item budget, so what is pinned is the
 * decision gate's invariant: rendered DOM is `O(visible + overscan + retained active)`, never
 * `O(total items)`. A tenfold source with an identical anchor count says exactly that, with no µs and
 * no machine dependence. If either scales with `count`, the window stopped bounding the render.
 */
describe('virtual rendering is bounded by the window, not the source', () => {
	const comments = (component: unknown, props: Record<string, unknown>) =>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(render(component as any, { props }).body.match(/<!--/g) ?? []).length;

	// Both halves are load-bearing: equality alone would also pass on an empty window, so prove the
	// server emitted a real first screen, then that a tenfold source does not enlarge it.
	it('createVirtual renders the same anchors for 1k and 10k items', () => {
		const shape = { height: 100, estimateSize: 10, overscan: 0 };
		const small = comments(VirtualTest, { ...shape, count: 1_000 });
		expect(small).toBeGreaterThan(0);
		expect(comments(VirtualTest, { ...shape, count: 10_000 })).toBe(small);
	});
});
