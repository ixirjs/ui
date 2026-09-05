import { describe, expect, it } from 'vitest';
import { median, roundOrder, validateSampling, pairedComparison } from './samples';

describe('benchmark sampling', () => {
	it('counterbalances both sides without mutating their registry', () => {
		const sides = ['ixir', 'shadcn'];
		expect(roundOrder(sides, 0)).toEqual(sides);
		expect(roundOrder(sides, 1)).toEqual(['shadcn', 'ixir']);
		expect(sides).toEqual(['ixir', 'shadcn']);
	});
	it('retains a representative endpoint rather than the minimum', () => {
		expect(median([1, 3, 100])).toBe(3);
		expect(median([4, 1, 3, 2])).toBe(2.5);
	});
	it('rejects absent, nonfinite or insufficient evidence', () => {
		expect(() => median([])).toThrow();
		expect(() => median([NaN])).toThrow();
		expect(() => median([Infinity])).toThrow();
		expect(() => median(new Array(4))).toThrow();
		expect(() => validateSampling(4, 3)).toThrow();
		expect(() => validateSampling(NaN, 3)).toThrow();
		expect(() => validateSampling(8, 0)).toThrow();
		expect(() => validateSampling(8, 3)).not.toThrow();
	});
});

describe('paired comparison evidence', () => {
	const reference = Array.from({ length: 16 }, (_, i) => 10 + i);
	it('reports reproducible paired intervals and direction, not a universal win', () => {
		const lower = pairedComparison(
			reference.map((v) => v / 2),
			reference
		);
		expect(lower.status).toBe('lower');
		expect(lower).toEqual(
			pairedComparison(
				reference.map((v) => v / 2),
				reference
			)
		);
		expect(lower.interval).toEqual([0.5, 0.5]);
		expect(
			pairedComparison(
				reference.map((v) => v * 2),
				reference
			).status
		).toBe('higher');
		expect(pairedComparison(reference, reference).status).toBe('inconclusive');
	});
	it('does not infer a win from insufficient, invalid or unpaired samples', () => {
		expect(pairedComparison([1, 2], [2, 3]).status).toBe('inconclusive');
		expect(pairedComparison([-1, 2], [2, 3]).status).toBe('inconclusive');
		expect(() => pairedComparison([], [])).toThrow();
		expect(() => pairedComparison([1], [1, 2])).toThrow();
		expect(() => pairedComparison([NaN], [1])).toThrow();
		expect(() => pairedComparison(Array(16).fill(Number.MAX_VALUE), reference)).toThrow();
	});
});
