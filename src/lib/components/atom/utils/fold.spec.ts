import { describe, expect, it } from 'vitest';
import { foldPresentation } from './fold';

// Pins the merge kernel's contract (ADR 0004 D5):
//     fallback → preset → variants → restProps   (each later layer wins)
// for string and symbol keys, plus per-layer skip sets and class-axis capture.
// resolvers.spec.ts pins the same order through the stage facade; this pins the kernel directly.

describe('foldPresentation — cascade precedence', () => {
	it('applies fallback < preset < variants < rest for string keys', () => {
		const out = foldPresentation(
			{ 'data-tier': 'fallback', 'data-fb': 'kept' },
			{ 'data-tier': 'preset' },
			{ 'data-tier': 'variant' },
			{ 'data-tier': 'rest' }
		);
		expect(out.attrs['data-tier']).toBe('rest');
		expect(out.attrs['data-fb']).toBe('kept'); // un-overridden keys survive
	});

	it('applies the SAME precedence to symbol keys (documented, not incidental)', () => {
		const sym = Symbol('attachment');
		const out = foldPresentation(
			{ [sym]: 'fallback' } as Record<string, unknown>,
			{ [sym]: 'preset' } as Record<string, unknown>,
			{ [sym]: 'variant' } as Record<string, unknown>,
			{ [sym]: 'rest' } as Record<string, unknown>
		);
		expect(out.attrs[sym]).toBe('rest');
	});

	it('symbol from an earlier layer survives when later layers omit it', () => {
		const sym = Symbol('preset-attachment');
		const out = foldPresentation(undefined, { [sym]: 'preset' } as Record<string, unknown>, undefined, {});
		expect(out.attrs[sym]).toBe('preset');
	});
});

describe('foldPresentation — skip sets', () => {
	it('strips internal config keys from preset and fallback (PRESET_SKIP)', () => {
		const layer = {
			class: 'x',
			base: 'x',
			as: 'x',
			variants: {},
			compounds: [],
			defaults: {},
			'data-kept': 'yes'
		};
		for (const out of [
			foldPresentation(layer, undefined, undefined, {}),
			foldPresentation(undefined, layer, undefined, {})
		]) {
			expect(out.attrs).not.toHaveProperty('class');
			expect(out.attrs).not.toHaveProperty('base');
			expect(out.attrs).not.toHaveProperty('as');
			expect(out.attrs).not.toHaveProperty('variants');
			expect(out.attrs).not.toHaveProperty('compounds');
			expect(out.attrs).not.toHaveProperty('defaults');
			expect(out.attrs['data-kept']).toBe('yes');
		}
	});

	it('strips variant-internal keys but allows `base`/`as` through (VARIANTS_SKIP)', () => {
		const out = foldPresentation(
			undefined,
			undefined,
			{ class: 'x', variants: {}, compounds: [], defaults: {}, as: 'span', 'data-v': '1' },
			{}
		);
		expect(out.attrs).not.toHaveProperty('class');
		expect(out.attrs).not.toHaveProperty('variants');
		expect(out.attrs.as).toBe('span'); // VARIANTS_SKIP does not include as/base
		expect(out.attrs['data-v']).toBe('1');
	});

	it('skips nothing from restProps — the consumer spread is sovereign', () => {
		const out = foldPresentation(undefined, undefined, undefined, { class: 'kept', as: 'kept' });
		expect(out.attrs.class).toBe('kept');
		expect(out.attrs.as).toBe('kept');
	});
});

describe('foldPresentation — class-axis capture', () => {
	it('captures preset.class and variants.class as separate fields', () => {
		const out = foldPresentation(
			undefined,
			{ class: 'preset-c' },
			{ class: ['variant-c'] },
			{}
		);
		expect(out.presetClass).toBe('preset-c');
		expect(out.variantClass).toEqual(['variant-c']);
	});

	it('returns undefined class fields when layers are absent', () => {
		const out = foldPresentation(undefined, undefined, undefined, {});
		expect(out.presetClass).toBeUndefined();
		expect(out.variantClass).toBeUndefined();
		expect(out.attrs).toEqual({});
	});
});
