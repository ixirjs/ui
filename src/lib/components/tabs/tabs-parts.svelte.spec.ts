import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedTabBond,
	capturedTabsBond,
	resetCapturedBonds
} from '$ixirjs/ui/test/components/tabs/tabs-atom-probe.test.svelte';
import RichPresetProbe from '$ixirjs/ui/test/components/tabs/tabs-rich-preset-probe.test.svelte';
import { TabsBond } from './bond.svelte';
import { TabBond } from './tab/bond.svelte';

// The tabs contract, as the DOM and the parent see it — what the old Atom spec asserted through
// registries and spreads.
describe('Tabs parts', () => {
	beforeEach(resetCapturedBonds);

	it('renders a tab header through a rich preset', () => {
		const { unmount } = render(RichPresetProbe);

		expect(document.querySelector('[data-rich-preset="yes"]')).not.toBeNull();

		unmount();
	});

	it('registers the tab and wires header and panel to each other', () => {
		const { unmount } = render(Probe);
		const tabs = capturedTabsBond!;
		const tab = capturedTabBond!;

		expect(tabs).toBeInstanceOf(TabsBond);
		expect(tab).toBeInstanceOf(TabBond);
		expect(tabs.props.value).toBe('one');
		expect(tab.props.value).toBe('one');
		expect(tabs.items.get('one')).toBe(tab);

		const root = document.getElementById(tabs.rootId)!;
		const tablist = document.getElementById(tabs.headerId)!;
		const body = document.getElementById(tabs.bodyId)!;
		const header = document.getElementById(tab.headerId)!;
		const panel = document.getElementById(tab.bodyId)!;

		expect(root.getAttribute('aria-orientation')).toBe('horizontal');
		expect(tablist.getAttribute('role')).toBe('tablist');
		expect(body.getAttribute('role')).toBe('group');
		// The header is portaled into the tablist.
		expect(header.parentElement).toBe(tablist);
		expect(header.getAttribute('role')).toBe('tab');
		expect(header.getAttribute('aria-selected')).toBe('true');
		expect(header.getAttribute('aria-controls')).toBe(panel.id);
		expect(panel.getAttribute('role')).toBe('tabpanel');
		expect(panel.getAttribute('aria-labelledby')).toBe(header.id);
		expect(panel.getAttribute('data-active')).toBe('true');
		// Description is inert: rendered, no id.
		expect(document.querySelector('p')?.id).toBe('');

		unmount();

		expect(tabs.items.get('one')).toBeUndefined();
		expect(Array.from(tabs.tabContents)).toEqual([]);
	});
});
