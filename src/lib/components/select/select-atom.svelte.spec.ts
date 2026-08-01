import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import { PopoverArrowAtom, PopoverIndicatorAtom, PopoverOverlayAtom } from '../popover/bond.svelte';
import { SelectItemAtom } from './item/bond.svelte';
import Probe, { capturedBond, resetCapturedBond } from './select-atom-probe.svelte';
import { SelectBond, SelectPlaceholderAtom, SelectQueryAtom } from './bond.svelte';

describe('Select component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered select nodes', () => {
		const { unmount } = render(Probe);
		const select = capturedBond;

		expect(select).toBeDefined();
		expect(select).toBeInstanceOf(SelectBond);
		expect(select?.isOpen).toBe(true);

		const trigger = select?.node('trigger');
		const overlay = select?.node('overlay');
		const content = select?.node('content');
		const placeholder = select?.node('placeholder');
		const query = select?.node('query');
		const item = select?.node('item');
		const arrow = select?.node('arrow');
		const indicator = select?.node('indicator');

		expect(overlay).toBeInstanceOf(PopoverOverlayAtom);
		expect(placeholder).toBeInstanceOf(SelectPlaceholderAtom);
		expect(query).toBeInstanceOf(SelectQueryAtom);
		expect(item).toBeInstanceOf(SelectItemAtom);
		expect(arrow).toBeInstanceOf(PopoverArrowAtom);
		expect(indicator).toBeInstanceOf(PopoverIndicatorAtom);
		for (const node of [trigger, overlay, content, placeholder, query, item, arrow, indicator]) {
			expect(node).toBeInstanceOf(Atom);
		}

		expect(content?.spread.role).toBe('listbox');
		expect(content?.spread['aria-multiselectable']).toBe(false);
		expect(query?.spread.role).toBe('combobox');
		expect(item?.spread.role).toBe('option');
		expect(select?.items.get('alpha')).toBe(item);

		const generated = select as unknown as Record<
			'trigger' | 'overlay' | 'content' | 'placeholder' | 'query' | 'item' | 'arrow' | 'indicator',
			() => Atom
		>;
		const generatedNodes = [
			generated.trigger(),
			generated.overlay(),
			generated.content(),
			generated.placeholder(),
			generated.query(),
			generated.item(),
			generated.arrow(),
			generated.indicator()
		];
		expect(generatedNodes[1]).toBeInstanceOf(PopoverOverlayAtom);
		expect(generatedNodes[3]).toBeInstanceOf(SelectPlaceholderAtom);
		expect(generatedNodes[4]).toBeInstanceOf(SelectQueryAtom);
		for (const node of generatedNodes) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(select?.nodes()).toEqual([]);
		expect(select?.items.get('alpha')).toBeUndefined();
	});
});
