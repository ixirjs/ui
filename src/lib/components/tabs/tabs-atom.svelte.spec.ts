import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedTabBond,
	capturedTabsBond,
	resetCapturedBonds
} from './tabs-atom-probe.svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import { TabsBodyAtom, TabsBond, TabsHeaderAtom, TabsRootAtom } from './bond.svelte';
import { TabBodyAtom, TabBond, TabDescriptionAtom, TabHeaderAtom } from './tab/bond.svelte';

describe('Tabs component-owned Atoms', () => {
	beforeEach(resetCapturedBonds);

	it('registers rendered tabs and tab nodes', () => {
		const { unmount } = render(Probe);
		const tabs = capturedTabsBond;
		const tab = capturedTabBond;

		expect(tabs).toBeDefined();
		expect(tab).toBeDefined();
		expect(tabs).toBeInstanceOf(TabsBond);
		expect(tab).toBeInstanceOf(TabBond);
		expect(tabs?.props.value).toBe('one');
		expect(tab?.props.value).toBe('one');

		const tabsRoot = tabs?.node('root');
		const tabsHeader = tabs?.node('header');
		const tabsBody = tabs?.node('body');
		const tabHeader = tab?.node('header');
		const tabBody = tab?.node('body');
		const tabDescription = tab?.node('description');

		expect(tabsRoot).toBeInstanceOf(TabsRootAtom);
		expect(tabsHeader).toBeInstanceOf(TabsHeaderAtom);
		expect(tabsBody).toBeInstanceOf(TabsBodyAtom);
		expect(tabHeader).toBeInstanceOf(TabHeaderAtom);
		expect(tabBody).toBeInstanceOf(TabBodyAtom);
		expect(tabDescription).toBeInstanceOf(TabDescriptionAtom);
		for (const node of [tabsRoot, tabsHeader, tabsBody, tabHeader, tabBody, tabDescription]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(tabs?.nodes()).toHaveLength(3);
		expect(tab?.nodes()).toHaveLength(3);
		expect(tabs?.items.get('one')).toBe(tab);

		expect(tabsRoot?.spread['aria-orientation']).toBe('horizontal');
		expect(tabsHeader?.spread.role).toBe('tablist');
		expect(tabsBody?.spread.role).toBe('group');
		expect(tabHeader?.spread.role).toBe('tab');
		expect(tabHeader?.spread['aria-selected']).toBe(true);
		expect(tabHeader?.spread['aria-controls']).toBe(tabBody?.id);
		expect(tabBody?.spread.role).toBe('tabpanel');
		expect(tabBody?.spread['aria-labelledby']).toBe(tabHeader?.id);
		expect(tabBody?.spread['data-active']).toBe(true);

		expect(typeof tabs?.root).toBe('function');
		expect(typeof tabs?.header).toBe('function');
		expect(typeof tabs?.body).toBe('function');
		expect(typeof tab?.header).toBe('function');
		expect(typeof tab?.body).toBe('function');
		expect(typeof tab?.description).toBe('function');
		expect(tabs?.root()).toBeInstanceOf(TabsRootAtom);
		expect(tabs?.header()).toBeInstanceOf(TabsHeaderAtom);
		expect(tabs?.body()).toBeInstanceOf(TabsBodyAtom);
		expect(tab?.header()).toBeInstanceOf(TabHeaderAtom);
		expect(tab?.body()).toBeInstanceOf(TabBodyAtom);
		expect(tab?.description()).toBeInstanceOf(TabDescriptionAtom);
		for (const node of [
			tabs?.root(),
			tabs?.header(),
			tabs?.body(),
			tab?.header(),
			tab?.body(),
			tab?.description()
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(tabs?.nodes()).toEqual([]);
		expect(tab?.nodes()).toEqual([]);
		expect(tabs?.items.get('one')).toBeUndefined();
	});
});
