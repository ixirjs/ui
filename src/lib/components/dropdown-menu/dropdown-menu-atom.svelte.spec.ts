import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/dropdown-menu/dropdown-menu-atom-probe.test.svelte';
import { DropdownMenuBond } from './bond.svelte';

/**
 * Rewritten DOM-level. It used to assert Atom instances through `nodeByPart` — machinery the
 * Kernel migration removed. Every rendered outcome it covered is asserted here instead: the
 * container's role, the item's role, id and preset key, and the registration released on unmount.
 */
describe('DropdownMenu rendered parts', () => {
	beforeEach(resetCapturedBond);

	it('renders the menu roles and releases its item registration on unmount', () => {
		const { unmount } = render(Probe);
		const dropdown = capturedBond;

		expect(dropdown).toBeDefined();
		expect(dropdown).toBeInstanceOf(DropdownMenuBond);
		expect(dropdown?.isOpen).toBe(true);

		const trigger = document.querySelector('[aria-haspopup="menu"]');
		expect(trigger).not.toBeNull();
		expect(trigger?.id).toBe(`dropdown-menu-trigger-${dropdown!.id}`);

		const content = document.querySelector('[role="menu"]');
		expect(content).not.toBeNull();
		expect(content?.getAttribute('aria-orientation')).toBe('vertical');

		const item = document.querySelector('[role="menuitem"]');
		expect(item).not.toBeNull();
		expect(item?.id).toBe('menu-item-alpha');

		expect(dropdown?.items.get('alpha')).toBeDefined();
		expect(dropdown?.items.get('alpha')?.element).toBe(item);
		expect(
			(dropdown?.items.get('alpha') as unknown as { preset: string } | undefined)?.preset
		).toBe('dropdown-menu.item');

		unmount();

		expect(document.querySelector('[role="menuitem"]')).toBeNull();
		expect(dropdown?.items.get('alpha')).toBeUndefined();
	});
});
