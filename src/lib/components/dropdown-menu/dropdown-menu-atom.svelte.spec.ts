import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/dropdown-menu/dropdown-menu-atom-probe.test.svelte';
import { DropdownMenuBond } from './bond.svelte';
import { DropdownMenuItemAtom as DropdownMenuRenderedItemAtom } from './item/bond.svelte';
import {
	PopoverTailAtom,
	PopoverIndicatorAtom,
	PopoverOverlayAtom
} from '$ixirjs/ui/components/popover/bond.svelte';

describe('DropdownMenu component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered dropdown nodes', () => {
		const { unmount } = render(Probe);
		const dropdown = capturedBond;

		expect(dropdown).toBeDefined();
		expect(dropdown).toBeInstanceOf(DropdownMenuBond);
		expect(dropdown?.isOpen).toBe(true);

		const trigger = dropdown?.nodeByPart('trigger');
		const overlay = dropdown?.nodeByPart('overlay');
		const content = dropdown?.nodeByPart('content');
		const item = dropdown?.nodeByPart('item');
		const tail = dropdown?.nodeByPart('tail');
		const indicator = dropdown?.nodeByPart('indicator');

		expect(overlay).toBeInstanceOf(PopoverOverlayAtom);
		expect(item).toBeInstanceOf(DropdownMenuRenderedItemAtom);
		expect(tail).toBeInstanceOf(PopoverTailAtom);
		expect(indicator).toBeInstanceOf(PopoverIndicatorAtom);
		for (const node of [trigger, overlay, content, item, tail, indicator]) {
			expect(node).toBeInstanceOf(Atom);
		}

		expect(content?.spread.role).toBe('menu');
		expect(item?.preset).toBe('dropdown-menu.item');
		expect(item?.spread.role).toBe('menuitem');
		expect(dropdown?.items.get('alpha')).toBe(item);

		unmount();

		for (const part of ['trigger', 'overlay', 'content', 'item', 'tail', 'indicator']) {
			expect(dropdown?.nodesByPart(part)).toEqual([]);
		}
		expect(dropdown?.items.get('alpha')).toBeUndefined();
	});
});
