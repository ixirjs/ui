import { describe, expect, it } from 'vitest';
import { ZLayer, LAYER_BASE } from './zlayer.svelte';

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

describe('ZLayer registry', () => {
	it('pre-registers the built-in layers', () => {
		expect(ZLayer.resolve('ambient')).toBe(LAYER_BASE.ambient);
	});

	it('resolves a registered custom layer by name', () => {
		ZLayer.register('command-palette', 600);
		expect(ZLayer.resolve('command-palette')).toBe(600);
		expect(new ZLayer('command-palette', undefined, undefined).value).toBe(600);
	});

	it('lets register override a built-in base', () => {
		ZLayer.register('ambient', 999);
		expect(new ZLayer('ambient', undefined, undefined).value).toBe(999);
		// Restore so the override does not leak into other tests.
		ZLayer.register('ambient', LAYER_BASE.ambient);
		expect(ZLayer.resolve('ambient')).toBe(LAYER_BASE.ambient);
	});

	it('throws a helpful error for an unknown layer name', () => {
		expect(() => new ZLayer('does-not-exist', undefined, undefined)).toThrow(
			/Unknown layer "does-not-exist"/
		);
	});
});

// Relative ordering against a registered reactive anchor — e.g. a popover beneath a sticky header.
describe('ZLayer relative ordering (anchors)', () => {
	it('falls back to the additive base when the anchor is not registered', () => {
		const layer = new ZLayer('positioned', undefined, undefined, { below: 'sticky-header' });
		expect(layer.value).toBe(LAYER_BASE.positioned);
	});

	it('orders just below a registered anchor', () => {
		const off = ZLayer.anchor('toolbar', () => 100);
		const layer = new ZLayer('positioned', undefined, undefined, { below: 'toolbar' });
		expect(layer.value).toBe(99);
		off();
	});

	it('orders just above a registered anchor', () => {
		const off = ZLayer.anchor('toolbar', () => 100);
		const layer = new ZLayer('positioned', undefined, undefined, { above: 'toolbar' });
		expect(layer.value).toBe(101);
		off();
	});

	it('adds the user offset on top of the relative value', () => {
		const off = ZLayer.anchor('toolbar', () => 100);
		const layer = new ZLayer('positioned', () => 5, undefined, { below: 'toolbar' });
		expect(layer.value).toBe(99 + 5);
		off();
	});

	it('reads the anchor lazily on every access', () => {
		let z = 50;
		const off = ZLayer.anchor('moving', () => z);
		const layer = new ZLayer('positioned', undefined, undefined, { below: 'moving' });
		expect(layer.value).toBe(49);
		z = 200;
		expect(layer.value).toBe(199);
		off();
	});

	it('reverts to the additive base after the anchor unregisters', () => {
		const off = ZLayer.anchor('toolbar', () => 100);
		const layer = new ZLayer('positioned', undefined, undefined, { below: 'toolbar' });
		expect(layer.value).toBe(99);
		off();
		expect(layer.value).toBe(LAYER_BASE.positioned);
	});

	it('readAnchor returns the current value or undefined', () => {
		expect(ZLayer.readAnchor('absent')).toBeUndefined();
		const off = ZLayer.anchor('present', () => 7);
		expect(ZLayer.readAnchor('present')).toBe(7);
		off();
		expect(ZLayer.readAnchor('present')).toBeUndefined();
	});
});
