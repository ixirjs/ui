import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import Probe, { capturedBond, resetCapturedBond } from './dropdown-menu-atom-probe.svelte';
import { DropdownMenuBond, DropdownMenuItemAtom as DropdownMenuSlotItemAtom } from './bond.svelte';
import { DropdownMenuItemAtom as DropdownMenuRenderedItemAtom } from './item/bond.svelte';
import { PopoverArrowAtom, PopoverIndicatorAtom, PopoverOverlayAtom } from '../popover/bond.svelte';

describe('DropdownMenu component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered dropdown nodes', () => {
		const { unmount } = render(Probe);
		const dropdown = capturedBond;

		expect(dropdown).toBeDefined();
		expect(dropdown).toBeInstanceOf(DropdownMenuBond);
		expect(dropdown?.isOpen).toBe(true);

		const trigger = dropdown?.node('trigger');
		const overlay = dropdown?.node('overlay');
		const content = dropdown?.node('content');
		const item = dropdown?.node('item');
		const arrow = dropdown?.node('arrow');
		const indicator = dropdown?.node('indicator');

		expect(overlay).toBeInstanceOf(PopoverOverlayAtom);
		expect(item).toBeInstanceOf(DropdownMenuRenderedItemAtom);
		expect(arrow).toBeInstanceOf(PopoverArrowAtom);
		expect(indicator).toBeInstanceOf(PopoverIndicatorAtom);
		for (const node of [trigger, overlay, content, item, arrow, indicator]) {
			expect(node).toBeInstanceOf(Atom);
		}

		expect(content?.spread.role).toBe('menu');
		expect(item?.preset).toBe('dropdown-menu.item');
		expect(item?.spread.role).toBe('menuitem');
		expect(dropdown?.items.get('alpha')).toBe(item);

		const generated = dropdown as unknown as Record<
			'trigger' | 'overlay' | 'content' | 'item' | 'arrow' | 'indicator',
			() => Atom
		>;
		const generatedNodes = [
			generated.trigger(),
			generated.overlay(),
			generated.content(),
			generated.item(),
			generated.arrow(),
			generated.indicator()
		];
		expect(generatedNodes[1]).toBeInstanceOf(PopoverOverlayAtom);
		expect(generatedNodes[3]).toBeInstanceOf(DropdownMenuSlotItemAtom);
		for (const node of generatedNodes) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(dropdown?.nodes()).toEqual([]);
		expect(dropdown?.items.get('alpha')).toBeUndefined();
	});
});
