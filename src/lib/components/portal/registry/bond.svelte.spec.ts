import { describe, expect, it } from 'vitest';
import { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
import { PortalsBond } from './bond.svelte';
import type { OverlayView } from '$ixirjs/ui/components/overlay';

function fakeOverlay(name: string) {
	return { name } as unknown as OverlayView;
}

describe('PortalsBond bands', () => {
	it('resolves built-in, numeric, and registered custom bands', () => {
		const props = $state({ id: 'root' });
		const portals = PortalsBond.create(props);

		expect(portals.band('modal')).toBe(20);
		expect(portals.band(42)).toBe(42);
		expect(portals.registerBand('command-palette', 40)).toBe(40);
		expect(portals.band('command-palette')).toBe(40);
	});

	it('keeps custom band registration local to each portals root', () => {
		const leftProps = $state({ id: 'left' });
		const rightProps = $state({ id: 'right' });
		const left = PortalsBond.create(leftProps);
		const right = PortalsBond.create(rightProps);

		left.registerBand('notification', 40);
		right.registerBand('notification', 50);

		expect(left.band('notification')).toBe(40);
		expect(right.band('notification')).toBe(50);
	});
});

describe('PortalBond locality', () => {
	it('keeps anchors local and always resolves relations at anchor ±1', () => {
		const leftProps = $state({ id: 'left' });
		const rightProps = $state({ id: 'right' });
		const left = PortalBond.create(leftProps);
		const right = PortalBond.create(rightProps);

		left.anchor('header', () => 10);
		right.anchor('header', () => 100);

		expect(left.elevation({ band: 'positioned', relation: { above: 'header' }, rank: 4 })).toBe(11);
		expect(right.elevation({ band: 'positioned', relation: { below: 'header' }, rank: 4 })).toBe(
			99
		);
		expect(left.elevation({ band: 'positioned', rank: 4 })).toBe(14);
	});
});

describe('PortalsBond overlay stack', () => {
	it('tracks top overlay per portals root', () => {
		const props = $state({ id: 'root' });
		const portals = PortalsBond.create(props);
		const a = fakeOverlay('a');
		const b = fakeOverlay('b');

		portals.enrollOverlay(a);
		expect(portals.isTopOverlay(a)).toBe(true);

		const offB = portals.enrollOverlay(b);
		expect(portals.isTopOverlay(b)).toBe(true);
		expect(portals.isTopOverlay(a)).toBe(false);

		expect(portals.rankOf(a, 'modal')).toBe(0);
		expect(portals.rankOf(b, 'modal')).toBe(0);

		offB();
		expect(portals.isTopOverlay(a)).toBe(true);
	});

	it('preserves defensive promotion for duplicate escape-only enrollment', () => {
		const props = $state({ id: 'root' });
		const portals = PortalsBond.create(props);
		const a = fakeOverlay('a');
		const b = fakeOverlay('b');

		portals.enrollOverlay(a);
		portals.enrollOverlay(b);
		portals.enrollOverlay(a);

		expect(portals.isTopOverlay(a)).toBe(true);
		expect(portals.isTopOverlay(b)).toBe(false);
	});

	it('ranks enrolled overlays within the same band by open order', () => {
		const props = $state({ id: 'root' });
		const portals = PortalsBond.create(props);
		const a = fakeOverlay('a');
		const b = fakeOverlay('b');
		const c = fakeOverlay('c');

		portals.enrollOverlay(a, 'modal');
		portals.enrollOverlay(b, 'positioned');
		portals.enrollOverlay(c, 'modal');

		expect(portals.rankOf(a, 'modal')).toBe(1);
		expect(portals.rankOf(c, 'modal')).toBe(2);
		expect(portals.rankOf(b, 'positioned')).toBe(1);
	});

	it('ranks the same band independently in each target portal', () => {
		const props = $state({ id: 'root' });
		const portals = PortalsBond.create(props);
		const left = { props: { id: 'left' } } as never;
		const right = { props: { id: 'right' } } as never;
		const a = fakeOverlay('a');
		const b = fakeOverlay('b');
		const c = fakeOverlay('c');

		portals.enrollOverlay(a, 'modal', left);
		portals.enrollOverlay(b, 'modal', right);
		portals.enrollOverlay(c, 'modal', left);

		expect(portals.rankOf(a, 'modal', left)).toBe(1);
		expect(portals.rankOf(c, 'modal', left)).toBe(2);
		expect(portals.rankOf(b, 'modal', right)).toBe(1);
	});

	it('coalesces escape and surface enrollment without promoting an existing owner', () => {
		const props = $state({ id: 'root' });
		const portals = PortalsBond.create(props);
		const a = fakeOverlay('a');
		const b = fakeOverlay('b');

		const offBand = portals.enrollOverlay(a, 'modal');
		portals.enrollOverlay(b, 'modal');
		const offEscape = portals.enrollOverlay(a);

		expect(portals.rankOf(a, 'modal')).toBe(1);
		expect(portals.rankOf(b, 'modal')).toBe(2);
		expect(portals.isTopOverlay(b)).toBe(true);
		expect(portals.isTopOverlay(a)).toBe(false);

		offEscape();
		expect(portals.rankOf(a, 'modal')).toBe(1);
		expect(portals.isTopOverlay(b)).toBe(true);

		offBand();
		expect(portals.rankOf(a, 'modal')).toBe(0);
	});

	it('keeps stacks scoped to each PortalsBond', () => {
		const leftProps = $state({ id: 'left' });
		const rightProps = $state({ id: 'right' });
		const left = PortalsBond.create(leftProps);
		const right = PortalsBond.create(rightProps);
		const a = fakeOverlay('a');
		const b = fakeOverlay('b');

		left.enrollOverlay(a);
		right.enrollOverlay(b);

		expect(left.isTopOverlay(a)).toBe(true);
		expect(right.isTopOverlay(b)).toBe(true);
	});
});
