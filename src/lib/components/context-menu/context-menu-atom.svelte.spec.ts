import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/context-menu/context-menu-atom-probe.test.svelte';
import { ContextMenuBond } from './bond.svelte';

/**
 * Rewritten DOM-level: it used to assert a `PopoverVirtualTriggerAtom` instance through
 * `nodeByPart`, machinery the Kernel migration removed. The virtual anchor is now a `$state` field
 * on the Bond, and what it exists to do — become the floating reference — is asserted directly.
 */
describe('ContextMenu virtual anchor', () => {
	beforeEach(resetCapturedBond);

	it('anchors the menu on the pointer, not on the trigger box', async () => {
		const { unmount } = render(Probe);
		const contextMenu = capturedBond;

		expect(contextMenu).toBeDefined();
		expect(contextMenu).toBeInstanceOf(ContextMenuBond);

		const trigger = document.querySelector<HTMLElement>('[aria-haspopup="menu"]')!;
		expect(trigger).not.toBeNull();
		// No gesture yet: the reference is the trigger element itself.
		expect(contextMenu?.virtualElement).toBeUndefined();
		expect(contextMenu?.reference).toBe(trigger);

		trigger.dispatchEvent(
			new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 60 })
		);

		expect(contextMenu?.virtualElement).toBeDefined();
		expect(contextMenu?.reference).toBe(contextMenu?.virtualElement);
		const rect = contextMenu!.virtualElement!.getBoundingClientRect();
		expect([rect.x, rect.y]).toEqual([40, 60]);

		unmount();
	});
});
