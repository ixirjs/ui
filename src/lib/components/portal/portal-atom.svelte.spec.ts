import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import Probe, { capturedBond, resetCapturedBond } from './portal-atom-probe.svelte';
import { PortalBond, PortalInnerAtom, PortalRootAtom } from './bond.svelte';

describe('Portal component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered portal nodes', () => {
		const { unmount } = render(Probe);
		const portal = capturedBond;

		expect(portal).toBeDefined();
		expect(portal).toBeInstanceOf(PortalBond);

		const root = portal?.node('root');
		const inner = portal?.node('inner');

		expect(root).toBeInstanceOf(PortalRootAtom);
		expect(inner).toBeInstanceOf(PortalInnerAtom);
		for (const node of [root, inner]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(portal?.boundaryElement).toBe(inner?.element);

		const legacyRoot = portal?.root();
		const legacyInner = portal?.inner();
		expect(legacyRoot).toBeInstanceOf(PortalRootAtom);
		expect(legacyInner).toBeInstanceOf(PortalInnerAtom);
		expect(legacyRoot).not.toBe(root);
		expect(legacyInner).not.toBe(inner);

		unmount();

		expect(portal?.nodes()).toEqual([]);
	});
});
