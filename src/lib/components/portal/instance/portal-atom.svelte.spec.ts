import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/portal/portal-atom-probe.test.svelte';
import { PortalBond, PortalInnerAtom, PortalRootAtom } from './bond.svelte';

describe('Portal component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered portal nodes', () => {
		const { unmount } = render(Probe);
		const portal = capturedBond;

		expect(portal).toBeDefined();
		expect(portal).toBeInstanceOf(PortalBond);

		const root = portal?.nodeByPart('root');
		const inner = portal?.nodeByPart('inner');

		expect(root).toBeInstanceOf(PortalRootAtom);
		expect(inner).toBeInstanceOf(PortalInnerAtom);
		for (const node of [root, inner]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(portal?.boundaryElement).toBe(inner?.element);

		expect(portal?.nodeByPart('root')).toBe(root);
		expect(portal?.nodeByPart('inner')).toBe(inner);

		unmount();

		expect(portal?.nodesByPart('root')).toEqual([]);
		expect(portal?.nodesByPart('inner')).toEqual([]);
	});
});
