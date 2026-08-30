import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/select/select-atom-probe.test.svelte';
import LayerProbe from '$ixirjs/ui/test/components/select/select-preset-probe.test.svelte';
import { SelectBond } from './bond.svelte';

/**
 * Rewritten DOM-level. It used to assert Atom instances through `nodeByPart` — machinery the
 * Kernel migration removed. Every rendered outcome it covered is asserted here instead: the
 * listbox role and its multi-select projection, the query control's combobox role, the option's
 * role and id, and the registration released on unmount. The per-instance layer case is unchanged.
 */
describe('Select rendered parts', () => {
	beforeEach(resetCapturedBond);

	it('renders the listbox roles and releases its option registration on unmount', () => {
		const { unmount } = render(Probe);
		const select = capturedBond;

		expect(select).toBeDefined();
		expect(select).toBeInstanceOf(SelectBond);
		expect(select?.isOpen).toBe(true);

		const trigger = document.querySelector('[aria-haspopup="listbox"]');
		expect(trigger).not.toBeNull();
		expect(trigger?.id).toBe(`select-trigger-${select!.id}`);

		const content = document.querySelector('[role="listbox"]');
		expect(content).not.toBeNull();
		expect(content?.getAttribute('aria-multiselectable')).toBe('false');

		expect(document.querySelector('input[role="combobox"]')).not.toBeNull();

		const option = document.querySelector('[role="option"]');
		expect(option).not.toBeNull();
		const item = select?.items.get('alpha');
		expect(item).toBeDefined();
		expect(option?.id).toBe(`select-item-${(item as unknown as { id: string }).id}`);
		expect(item?.element).toBe(option);

		unmount();

		expect(document.querySelector('[role="option"]')).toBeNull();
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
