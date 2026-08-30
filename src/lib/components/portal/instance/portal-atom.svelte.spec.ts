import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/portal/portal-atom-probe.test.svelte';
import { PortalBond } from './bond.svelte';

// The rendered parts announce themselves to the portal: Outer renders the portal id, Inner
// hands the portal its sink element and withdraws it on unmount.
describe('Portal rendered parts', () => {
	beforeEach(resetCapturedBond);

	it('binds the Inner element as the sink for the portal it rendered under', () => {
		const { unmount } = render(Probe);
		const portal = capturedBond;

		expect(portal).toBeDefined();
		expect(portal).toBeInstanceOf(PortalBond);

		const root = document.getElementById('probe');
		const inner = document.getElementById('portal-inner-probe');
		expect(root).not.toBeNull();
		expect(inner).not.toBeNull();
		expect(root?.contains(inner)).toBe(true);
		expect(portal?.boundaryElement).toBe(inner);

		unmount();

		expect(portal?.boundaryElement).toBeUndefined();
	});
});
