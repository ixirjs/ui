import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/context-menu/context-menu-atom-probe.test.svelte';
import { ContextMenuBond } from './bond.svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import { PopoverVirtualTriggerAtom } from '$ixirjs/ui/components/popover';

describe('ContextMenu component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers its virtual trigger node without using legacy Atom compatibility classes', () => {
		const { unmount } = render(Probe);
		const contextMenu = capturedBond;

		expect(contextMenu).toBeDefined();
		expect(contextMenu).toBeInstanceOf(ContextMenuBond);

		const virtualTrigger = contextMenu?.nodeByPart('virtual-trigger');

		expect(virtualTrigger).toBeInstanceOf(PopoverVirtualTriggerAtom);
		expect(virtualTrigger).toBeInstanceOf(Atom);

		unmount();

		expect(contextMenu?.nodeByPart('virtual-trigger')).toBeUndefined();
	});
});
