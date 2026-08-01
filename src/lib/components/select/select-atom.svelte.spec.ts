import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import {
	PopoverTailAtom,
	PopoverIndicatorAtom,
	PopoverOverlayAtom
} from '$ixirjs/ui/components/popover/bond.svelte';
import { SelectItemAtom } from './item/bond.svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/select/select-atom-probe.test.svelte';
import LayerProbe from '$ixirjs/ui/test/components/select/select-preset-probe.test.svelte';
import { SelectBond, SelectPlaceholderAtom, SelectQueryAtom } from './bond.svelte';

describe('Select component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered select nodes', () => {
		const { unmount } = render(Probe);
		const select = capturedBond;

		expect(select).toBeDefined();
		expect(select).toBeInstanceOf(SelectBond);
		expect(select?.isOpen).toBe(true);

		const trigger = select?.nodeByPart('trigger');
		const overlay = select?.nodeByPart('overlay');
		const content = select?.nodeByPart('content');
		const placeholder = select?.nodeByPart('placeholder');
		const query = select?.nodeByPart('query');
		const item = select?.nodeByPart('item');
		const tail = select?.nodeByPart('tail');
		const indicator = select?.nodeByPart('indicator');

		expect(overlay).toBeInstanceOf(PopoverOverlayAtom);
		expect(placeholder).toBeInstanceOf(SelectPlaceholderAtom);
		expect(query).toBeInstanceOf(SelectQueryAtom);
		expect(item).toBeInstanceOf(SelectItemAtom);
		expect(tail).toBeInstanceOf(PopoverTailAtom);
		expect(indicator).toBeInstanceOf(PopoverIndicatorAtom);
		for (const node of [trigger, overlay, content, placeholder, query, item, tail, indicator]) {
			expect(node).toBeInstanceOf(Atom);
		}

		expect(content?.spread.role).toBe('listbox');
		expect(content?.spread['aria-multiselectable']).toBe(false);
		expect(query?.spread.role).toBe('combobox');
		expect(item?.spread.role).toBe('option');
		expect(select?.items.get('alpha')).toBe(item);

		unmount();

		for (const part of [
			'trigger',
			'overlay',
			'content',
			'placeholder',
			'query',
			'item',
			'tail',
			'indicator'
		]) {
			expect(select?.nodesByPart(part)).toEqual([]);
		}
		expect(select?.items.get('alpha')).toBeUndefined();
	});

	it('applies root-owned layers through composed Popover and Select parts', () => {
		const { unmount } = render(LayerProbe, {
			presets: {
				trigger: { class: 'instance-trigger', attrs: { 'data-instance': 'trigger' } },
				content: { class: 'instance-content', attrs: { 'data-instance': 'content' } },
				item: { class: 'instance-item', attrs: { 'data-instance': 'item' } },
				placeholder: { class: 'instance-placeholder', attrs: { 'data-instance': 'placeholder' } },
				query: { class: 'instance-query', attrs: { 'data-instance': 'query' } },
				tail: { class: 'instance-tail', attrs: { 'data-instance': 'tail' } },
				indicator: { class: 'instance-indicator', attrs: { 'data-instance': 'indicator' } }
			}
		});

		for (const value of [
			'trigger',
			'content',
			'item',
			'placeholder',
			'query',
			'tail',
			'indicator'
		]) {
			expect(
				document.querySelector(`.instance-${value}[data-instance="${value}"]`),
				value
			).not.toBeNull();
		}
		unmount();
	});
});
