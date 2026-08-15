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
	// Toast is the live-region family: role/aria-live/aria-atomic come from a capability, not the
	// atom, and nothing else in the suite renders those attrs.
	'toast',
	'tree',
	// Complements `bench:ssr` with byte-level popover, calendar, and scrollable coverage.
	//
	// Drawer and DatePicker are absent on purpose — their content portals, so the server emits only
	// anchors and a snapshot would read as coverage that is not there. They need a client-side ARIA
	// spec instead. Scrollable is here for root/container/content only; its track and thumb are
	// likewise client-only.
	'popover',
	'calendar',
	'scrollable',
	// The static, Bond-less shape. Nothing else in this suite covers it, and `bench:ssr` has no
	// button or badge layer — so the components most consumers render most often had no byte-level
	// gate at all.
	'button',
	'badge',
	// The small static leaves, grouped: divider, label, link, kbd, chip.
	'primitives'
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
