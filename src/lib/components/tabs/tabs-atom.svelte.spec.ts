import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedTabBond,
	capturedTabsBond,
	resetCapturedBonds
} from '$ixirjs/ui/test/components/tabs/tabs-atom-probe.test.svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
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

		const tabsRoot = tabs?.nodeByPart('root');
		const tabsHeader = tabs?.nodeByPart('header');
		const tabsBody = tabs?.nodeByPart('body');
		const tabHeader = tab?.nodeByPart('header');
		const tabBody = tab?.nodeByPart('body');
		const tabDescription = tab?.nodeByPart('description');

		expect(tabsRoot).toBeInstanceOf(TabsRootAtom);
		expect(tabsHeader).toBeInstanceOf(TabsHeaderAtom);
		expect(tabsBody).toBeInstanceOf(TabsBodyAtom);
		expect(tabHeader).toBeInstanceOf(TabHeaderAtom);
		expect(tabBody).toBeInstanceOf(TabBodyAtom);
		expect(tabDescription).toBeInstanceOf(TabDescriptionAtom);
		for (const node of [tabsRoot, tabsHeader, tabsBody, tabHeader, tabBody, tabDescription]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(tabs?.nodesByPart('root')).toEqual([tabsRoot]);
		expect(tabs?.nodesByPart('header')).toEqual([tabsHeader]);
		expect(tabs?.nodesByPart('body')).toEqual([tabsBody]);
		expect(tab?.nodesByPart('header')).toEqual([tabHeader]);
		expect(tab?.nodesByPart('body')).toEqual([tabBody]);
		expect(tab?.nodesByPart('description')).toEqual([tabDescription]);
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

		expect(tabs?.nodeByPart('root')).toBeInstanceOf(TabsRootAtom);
		expect(tabs?.nodeByPart('header')).toBeInstanceOf(TabsHeaderAtom);
		expect(tabs?.nodeByPart('body')).toBeInstanceOf(TabsBodyAtom);
		expect(tab?.nodeByPart('header')).toBeInstanceOf(TabHeaderAtom);
		expect(tab?.nodeByPart('body')).toBeInstanceOf(TabBodyAtom);
		expect(tab?.nodeByPart('description')).toBeInstanceOf(TabDescriptionAtom);
		for (const node of [
			tabs?.nodeByPart('root'),
			tabs?.nodeByPart('header'),
			tabs?.nodeByPart('body'),
			tab?.nodeByPart('header'),
			tab?.nodeByPart('body'),
			tab?.nodeByPart('description')
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		for (const part of ['root', 'header', 'body']) {
			expect(tabs?.nodesByPart(part)).toEqual([]);
		}
		for (const part of ['header', 'body', 'description']) {
			expect(tab?.nodesByPart(part)).toEqual([]);
		}
		expect(tabs?.items.get('one')).toBeUndefined();
	});
});
