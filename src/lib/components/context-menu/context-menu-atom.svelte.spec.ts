import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, { capturedBond, resetCapturedBond } from './context-menu-atom-probe.svelte';
import { ContextMenuBond } from './bond.svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import { PopoverVirtualTriggerAtom } from '../popover';

describe('ContextMenu component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers its virtual trigger node without using legacy Atom compatibility classes', () => {
		const { unmount } = render(Probe);
		const contextMenu = capturedBond;

		expect(contextMenu).toBeDefined();
		expect(contextMenu).toBeInstanceOf(ContextMenuBond);

		const virtualTrigger = contextMenu?.node('virtual-trigger');

		expect(virtualTrigger).toBeInstanceOf(PopoverVirtualTriggerAtom);
		expect(virtualTrigger).toBeInstanceOf(Atom);
		expect(
			(contextMenu as unknown as Record<'virtual-trigger', () => Atom>)['virtual-trigger']()
		).toBeInstanceOf(PopoverVirtualTriggerAtom);

		unmount();

		expect(contextMenu?.node('virtual-trigger')).toBeUndefined();
	});
});
