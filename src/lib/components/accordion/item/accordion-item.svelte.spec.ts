import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/accordion/item/accordion-item-atom-probe.test.svelte';
import { AccordionItemBond } from './bond.svelte';
import { AccordionBond } from '$ixirjs/ui/components/accordion/bond.svelte';

// The item's contract, as the DOM and the parent see it — what the old Atom spec asserted through
// registries and spreads.
describe('AccordionItem', () => {
	beforeEach(resetCapturedBond);

	it('registers with its accordion and wires header and body to each other', () => {
		const { unmount } = render(Probe);
		const bond = capturedBond;

		expect(bond).toBeInstanceOf(AccordionItemBond);
		expect(bond?.isOpen).toBe(true);
		const parent = bond?.parent as AccordionBond;
		expect(parent).toBeInstanceOf(AccordionBond);
		expect(parent.items.get('one')).toBe(bond);

		const root = document.getElementById(bond!.rootId)!;
		const header = document.getElementById(bond!.headerId)!;
		const body = document.getElementById(bond!.bodyId)!;
		const indicator = document.getElementById(bond!.indicatorId)!;
		expect(root.tagName).toBe('DIV');
		expect(header.tagName).toBe('BUTTON');
		expect(header.getAttribute('aria-expanded')).toBe('true');
		expect(header.getAttribute('aria-controls')).toBe(body.id);
		expect(header.getAttribute('data-state')).toBe('open');
		expect(header.tabIndex).toBe(0);
		expect(body.getAttribute('role')).toBe('region');
		expect(body.getAttribute('aria-labelledby')).toBe(header.id);
		expect(indicator.getAttribute('data-controled-by')).toBe(parent.id);

		unmount();
		expect(parent.items.get('one')).toBeUndefined();
	});
});
