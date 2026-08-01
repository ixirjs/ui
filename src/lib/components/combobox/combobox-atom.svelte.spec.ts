import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import { PopoverArrowAtom, PopoverIndicatorAtom, PopoverOverlayAtom } from '../popover/bond.svelte';
import { SelectPlaceholderAtom, SelectQueryAtom } from '../select/bond.svelte';
import { SelectItemAtom } from '../select/item/bond.svelte';
import Probe, { capturedBond, resetCapturedBond } from './combobox-atom-probe.svelte';
import { ComboboxBond, ComboboxControlAtom } from './bond.svelte';

describe('Combobox component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered combobox nodes', () => {
		const { unmount } = render(Probe);
		const combobox = capturedBond;

		expect(combobox).toBeDefined();
		expect(combobox).toBeInstanceOf(ComboboxBond);
		expect(combobox?.isOpen).toBe(true);

		const trigger = combobox?.node('trigger');
		const overlay = combobox?.node('overlay');
		const content = combobox?.node('content');
		const placeholder = combobox?.node('placeholder');
		const control = combobox?.node('control');
		const query = combobox?.node('query');
		const item = combobox?.node('item');
		const arrow = combobox?.node('arrow');
		const indicator = combobox?.node('indicator');

		expect(overlay).toBeInstanceOf(PopoverOverlayAtom);
		expect(placeholder).toBeInstanceOf(SelectPlaceholderAtom);
		expect(control).toBeInstanceOf(ComboboxControlAtom);
		expect(query).toBeInstanceOf(SelectQueryAtom);
		expect(item).toBeInstanceOf(SelectItemAtom);
		expect(arrow).toBeInstanceOf(PopoverArrowAtom);
		expect(indicator).toBeInstanceOf(PopoverIndicatorAtom);
		for (const node of [
			trigger,
			overlay,
			content,
			placeholder,
			control,
			query,
			item,
			arrow,
			indicator
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		expect(content?.spread.role).toBe('listbox');
		expect(control?.spread.role).toBe('combobox');
		expect(query?.spread.role).toBe('combobox');
		expect(item?.spread.role).toBe('option');
		expect(combobox?.items.get('alpha')).toBe(item);

		const generated = combobox as unknown as Record<
			| 'trigger'
			| 'overlay'
			| 'content'
			| 'placeholder'
			| 'control'
			| 'query'
			| 'item'
			| 'arrow'
			| 'indicator',
			() => Atom
		>;
		const generatedNodes = [
			generated.trigger(),
			generated.overlay(),
			generated.content(),
			generated.placeholder(),
			generated.control(),
			generated.query(),
			generated.item(),
			generated.arrow(),
			generated.indicator()
		];
		expect(generatedNodes[1]).toBeInstanceOf(PopoverOverlayAtom);
		expect(generatedNodes[3]).toBeInstanceOf(SelectPlaceholderAtom);
		expect(generatedNodes[4]).toBeInstanceOf(ComboboxControlAtom);
		expect(generatedNodes[5]).toBeInstanceOf(SelectQueryAtom);
		for (const node of generatedNodes) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(combobox?.nodes()).toEqual([]);
		expect(combobox?.items.get('alpha')).toBeUndefined();
	});
});
