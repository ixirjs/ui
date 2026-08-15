import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Probe, { type Menu } from './menu-ssr-probe.test.svelte';
import PresetProbe from './menu-preset-probe.test.svelte';

/**
 * Server-render fidelity for the overlay/menu families.
 *
 * `family-ssr.spec.ts` covers the bonded compound families and `control-ssr.spec.ts` the form
 * controls; neither includes select, combobox, dropdown menu, context menu or tooltip. Those are
 * exactly the families whose items go through a wrapper component — `Select.Item` and
 * `DropdownMenu.Item` mount `List.Item` and forward with `{...spread}` — so this is the gate that
 * makes collapsing those wrappers a checkable change rather than a hopeful one.
 *
 * **Two assertions per case, and they carry different weight.**
 *
 * The raw body is the DOM-mass ratchet: collapsing a wrapper removes a component invocation, the
 * implicit `children` snippet passed to it, and the inner `{@render children?.(arg)}` — three
 * comment nodes per item. That snapshot is *expected* to shrink, and shrinking is the win.
 *
 * The comment-stripped body is the equivalence claim, and it must **not** move. Every failure mode
 * that matters shows up there and nowhere else: a `$preset` sentinel placing in a different
 * position, the dead `list.item` preset fallback coming back to life (`px-4 py-3` where
 * `select.item` wants `px-2 py-1.5`), an attribute landing on the other side of the consumer's own.
 * Each of those is a silent restyle of every menu in every consuming app.
 *
 * A moved element snapshot is a defect to investigate, not a snapshot to update.
 *
 * **Element-only is asserted FIRST, deliberately.** Vitest abandons a test at its first failed
 * assertion, so with the raw body checked first, a legitimately-shrinking raw snapshot would abort
 * the test before the equivalence claim ever ran — reporting a failure whose real content was never
 * evaluated, and passing silently for the one case that mattered. Check the invariant, then the
 * ratchet.
 */
const MENUS: Menu[] = [
	'select',
	'combobox',
	'dropdown-menu',
	'context-menu',
	'tooltip',
	'select-edge',
	'dropdown-menu-edge'
];

/** Only the families with items are worth running twice; a tooltip has no item to restyle. */
const PRESET_MENUS: Menu[] = ['select', 'combobox', 'dropdown-menu', 'context-menu'];

const elementsOnly = (body: string) => body.replace(/<!--[\s\S]*?-->/g, '');

describe('menu SSR fidelity', () => {
	for (const menu of MENUS) {
		it(`renders ${menu} identically`, () => {
			const body = render(Probe, { props: { menu } }).body;
			expect(elementsOnly(body)).toMatchSnapshot();
			expect(body).toMatchSnapshot();
		});
	}

	// With `defaultPreset` installed, so sentinel placement and the resolved preset key are both
	// observable. See `menu-preset-probe.test.svelte` for why this is a separate component.
	for (const menu of PRESET_MENUS) {
		it(`renders ${menu} identically with a preset installed`, () => {
			const body = render(PresetProbe, { props: { menu } }).body;
			expect(elementsOnly(body)).toMatchSnapshot();
			expect(body).toMatchSnapshot();
		});
	}
});
