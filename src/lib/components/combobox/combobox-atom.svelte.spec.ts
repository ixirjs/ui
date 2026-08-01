import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import {
	PopoverTailAtom,
	PopoverIndicatorAtom,
	PopoverOverlayAtom
} from '$ixirjs/ui/components/popover/bond.svelte';
import { SelectPlaceholderAtom, SelectQueryAtom } from '$ixirjs/ui/components/select/bond.svelte';
import { SelectItemAtom } from '$ixirjs/ui/components/select/item/bond.svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/combobox/combobox-atom-probe.test.svelte';
import { ComboboxBond, ComboboxControlAtom } from './bond.svelte';

describe('Combobox component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered combobox nodes', () => {
		const { unmount } = render(Probe);
		const combobox = capturedBond;

		expect(combobox).toBeDefined();
		expect(combobox).toBeInstanceOf(ComboboxBond);
		expect(combobox?.isOpen).toBe(true);

		const trigger = combobox?.nodeByPart('trigger');
		const overlay = combobox?.nodeByPart('overlay');
		const content = combobox?.nodeByPart('content');
		const placeholder = combobox?.nodeByPart('placeholder');
		const control = combobox?.nodeByPart('control');
		const query = combobox?.nodeByPart('query');
		const item = combobox?.nodeByPart('item');
		const tail = combobox?.nodeByPart('tail');
		const indicator = combobox?.nodeByPart('indicator');

		expect(overlay).toBeInstanceOf(PopoverOverlayAtom);
		expect(placeholder).toBeInstanceOf(SelectPlaceholderAtom);
		expect(control).toBeInstanceOf(ComboboxControlAtom);
		expect(query).toBeInstanceOf(SelectQueryAtom);
		expect(item).toBeInstanceOf(SelectItemAtom);
		expect(tail).toBeInstanceOf(PopoverTailAtom);
		expect(indicator).toBeInstanceOf(PopoverIndicatorAtom);
		for (const node of [
			trigger,
			overlay,
			content,
			placeholder,
			control,
			query,
			item,
			tail,
			indicator
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		expect(content?.spread.role).toBe('listbox');
		expect(control?.spread.role).toBe('combobox');
		expect(query?.spread.role).toBe('combobox');
		expect(item?.spread.role).toBe('option');
		expect(combobox?.items.get('alpha')).toBe(item);

		unmount();

		for (const part of [
			'trigger',
			'overlay',
			'content',
			'placeholder',
			'control',
			'query',
			'item',
			'tail',
			'indicator'
		]) {
			expect(combobox?.nodesByPart(part)).toEqual([]);
		}
		expect(combobox?.items.get('alpha')).toBeUndefined();
	});
});
