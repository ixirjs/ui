import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/drawer/drawer-repeated-header.test.svelte';

// Replaces the registry spec (`nodesByPart('header')`): a layout part has no cardinality on the
// redesigned Kernel — repeating it renders it again, and nothing in the Bond has to know.
describe('Drawer layout parts', () => {
	it('renders repeated headers and bodies', () => {
		resetCapturedBond();
		const { unmount } = render(Fixture);

		expect(capturedBond?.isOpen).toBe(true);
		expect(document.querySelectorAll('[data-testid="drawer-header"]')).toHaveLength(2);
		expect(document.querySelectorAll('[data-testid="drawer-body"]')).toHaveLength(2);
		unmount();
		expect(document.querySelectorAll('[data-testid="drawer-header"]')).toHaveLength(0);
		expect(document.querySelectorAll('[data-testid="drawer-body"]')).toHaveLength(0);
	});
});
