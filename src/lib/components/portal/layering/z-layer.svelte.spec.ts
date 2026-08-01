import { describe, expect, it } from 'vitest';
import { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
import { PortalsBond } from '$ixirjs/ui/components/portal/registry';
import { ZLayer, LAYER_BASE, resolveZIndexOffset } from './z-layer.svelte';

function makePortals(id = 'root') {
	const props = $state({ id });
	return PortalsBond.create(props);
}

function makePortal(id = 'local') {
	const props = $state({ id });
	return PortalBond.create(props);
}

// `value` resolution and parent elevation are exercised through the explicit
// `parent` constructor argument. Context wiring (tryGet/share) is the same code
// path — these tests pin the math that the context lookup feeds into.
describe('ZLayer.value', () => {
	it('resolves a named base to its LAYER_BASE value', () => {
		expect(new ZLayer('modal', undefined, undefined).value).toBe(LAYER_BASE.modal);
	});

	it('accepts a raw numeric base', () => {
		expect(new ZLayer(42, undefined, undefined).value).toBe(42);
	});

	it('adds the user offset to the base', () => {
		expect(new ZLayer('modal', () => 5, undefined).value).toBe(LAYER_BASE.modal + 5);
	});

	it('reads the offset lazily on every access', () => {
		let offset = 0;
		const layer = new ZLayer('modal', () => offset, undefined);
		expect(layer.value).toBe(LAYER_BASE.modal);
		offset = 10;
		expect(layer.value).toBe(LAYER_BASE.modal + 10);
	});
});

describe('resolveZIndexOffset', () => {
	it('treats a number as an offset from the natural layer', () => {
		expect(resolveZIndexOffset(3, LAYER_BASE.modal)).toBe(3);
	});

	it('treats a function as final z-index from the natural layer', () => {
		expect(resolveZIndexOffset((natural) => natural + 7, LAYER_BASE.modal)).toBe(7);
	});

	it('falls back to zero for missing or non-finite inputs', () => {
		expect(resolveZIndexOffset(undefined, LAYER_BASE.modal)).toBe(0);
		expect(resolveZIndexOffset(Number.NaN, LAYER_BASE.modal)).toBe(0);
	});
});

describe('ZLayer parent elevation', () => {
	it('stacks above its parent (positioned in modal)', () => {
		const modal = new ZLayer('modal', undefined, undefined);
		const positioned = new ZLayer('positioned', undefined, modal);
		expect(positioned.value).toBe(LAYER_BASE.positioned + LAYER_BASE.modal);
		expect(positioned.value).toBeGreaterThan(modal.value);
	});

	it('elevates a lower-base child above its parent (positioned in modal)', () => {
		// A bare positioned overlay (10) sits below a bare modal (20); nested inside
		// one it must still render above it — the regression this centralization fixes.
		const modal = new ZLayer('modal', undefined, undefined);
		const positioned = new ZLayer('positioned', undefined, modal);
		expect(positioned.value).toBeGreaterThan(modal.value);
	});

	it('accumulates through multiple levels of nesting', () => {
		const modal = new ZLayer('modal', undefined, undefined);
		const positioned = new ZLayer('positioned', undefined, modal);
		const nestedPositioned = new ZLayer('positioned', undefined, positioned);
		expect(nestedPositioned.value).toBe(2 * LAYER_BASE.positioned + LAYER_BASE.modal);
		expect(nestedPositioned.value).toBeGreaterThan(positioned.value);
	});

	it('carries the parent offset into the child', () => {
		const modal = new ZLayer('modal', () => 7, undefined);
		const positioned = new ZLayer('positioned', undefined, modal);
		expect(positioned.value).toBe(LAYER_BASE.positioned + LAYER_BASE.modal + 7);
	});
});

describe('ZLayer band scopes', () => {
	it('resolves built-in bases without an owner', () => {
		expect(ZLayer.resolve('ambient')).toBe(LAYER_BASE.ambient);
		expect(new ZLayer('ambient', undefined, undefined).value).toBe(LAYER_BASE.ambient);
	});

	it('keeps custom bands scoped to their Portals owner', () => {
		const left = makePortals('left');
		const right = makePortals('right');

		left.registerBand('command-palette', 600);
		right.registerBand('command-palette', 700);

		expect(left.band('command-palette')).toBe(600);
		expect(right.band('command-palette')).toBe(700);
	});

	it('keeps built-in overrides scoped to their Portals owner', () => {
		const overridden = makePortals('overridden');
		const untouched = makePortals('untouched');

		overridden.registerBand('ambient', 999);

		expect(overridden.band('ambient')).toBe(999);
		expect(untouched.band('ambient')).toBe(LAYER_BASE.ambient);
		expect(new ZLayer('ambient', undefined, undefined).value).toBe(LAYER_BASE.ambient);
	});

	it('throws a helpful error for an unknown layer name', () => {
		expect(() => new ZLayer('does-not-exist', undefined, undefined)).toThrow(
			/Unknown layer "does-not-exist"/
		);
	});
});

// Relative ordering uses the owning Portal's scoped anchor registry — e.g. a popover beneath a
// sticky header. This exercises the scoped APIs directly instead of relying on module-global state.
describe('ZLayer relative ordering (portal-local anchors)', () => {
	it('falls back to the additive base when the anchor is not registered', () => {
		const portal = makePortal();
		expect(portal.elevation({ band: 'positioned', relation: { below: 'sticky-header' } })).toBe(
			LAYER_BASE.positioned
		);
	});

	it('orders just below and above a registered anchor', () => {
		const portal = makePortal();
		const off = portal.anchor('toolbar', () => 100);

		expect(portal.elevation({ band: 'positioned', relation: { below: 'toolbar' } })).toBe(99);
		expect(portal.elevation({ band: 'positioned', relation: { above: 'toolbar' } })).toBe(101);
		off();
	});

	it('keeps anchors local to their Portal owner', () => {
		const left = makePortal('left');
		const right = makePortal('right');
		left.anchor('toolbar', () => 100);
		right.anchor('toolbar', () => 200);

		expect(left.elevation({ band: 'positioned', relation: { below: 'toolbar' } })).toBe(99);
		expect(right.elevation({ band: 'positioned', relation: { below: 'toolbar' } })).toBe(199);
	});

	it('adds the user offset on top of the relative value', () => {
		const portal = makePortal();
		const off = portal.anchor('toolbar', () => 100);

		expect(
			portal.elevation({
				band: 'positioned',
				relation: { below: 'toolbar' },
				'z-index': 5
			})
		).toBe(104);
		off();
	});

	it('reads the anchor lazily on every access', () => {
		const portal = makePortal();
		let z = 50;
		const off = portal.anchor('moving', () => z);

		expect(portal.elevation({ band: 'positioned', relation: { below: 'moving' } })).toBe(49);
		z = 200;
		expect(portal.elevation({ band: 'positioned', relation: { below: 'moving' } })).toBe(199);
		off();
	});

	it('reverts to the additive base after the anchor unregisters', () => {
		const portal = makePortal();
		const off = portal.anchor('toolbar', () => 100);

		expect(portal.elevation({ band: 'positioned', relation: { below: 'toolbar' } })).toBe(99);
		off();
		expect(portal.elevation({ band: 'positioned', relation: { below: 'toolbar' } })).toBe(
			LAYER_BASE.positioned
		);
	});

	it('readAnchor returns the current value or undefined', () => {
		const portal = makePortal();
		expect(portal.readAnchor('absent')).toBeUndefined();
		const off = portal.anchor('present', () => 7);
		expect(portal.readAnchor('present')).toBe(7);
		off();
		expect(portal.readAnchor('present')).toBeUndefined();
	});
});
