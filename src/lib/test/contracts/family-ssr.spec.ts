import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Probe, { type Family } from './family-ssr-probe.test.svelte';

/**
 * Per-family server-render fidelity.
 *
 * The benchmark proves cost on four layers; this proves *output* across the families that carry
 * the seams a kernel change touches — disclosure state, relationship ARIA, role projection and
 * nested bonds. A refactor of the presentation kernel or the part authoring seam is only
 * equivalence-preserving if these snapshots do not move.
 *
 * When a snapshot does change, read the diff before updating it. The interesting failures are
 * a dropped `aria-*` reference, an id that stopped being derived from the bond seed, or a preset
 * class landing on the wrong side of the consumer's own class.
 */
const FAMILIES: Family[] = [
	'accordion',
	'alert',
	'card',
	'collapsible',
	'tabs',
	'stepper',
	'breadcrumb',
	'list',
	'progress',
	'stack',
	'tree'
];

describe('component family SSR fidelity', () => {
	for (const family of FAMILIES) {
		it(`renders ${family} identically`, () => {
			expect(render(Probe, { props: { family } }).body).toMatchSnapshot();
		});
	}

	// Ids are seeded from `$props.id()` so server output is reproducible; a random seed would make
	// hydration non-deterministic and would also make every snapshot above useless.
	for (const family of FAMILIES) {
		it(`renders ${family} deterministically across independent renders`, () => {
			expect(render(Probe, { props: { family } }).body).toBe(
				render(Probe, { props: { family } }).body
			);
		});
	}
});
