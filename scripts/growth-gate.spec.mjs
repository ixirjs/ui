import { describe, expect, it } from 'vitest';
import { evaluateGrowth, growth } from './growth-gate.mjs';

const counts = [50, 100, 200, 400];
const row = (k = 1) => ({ name: 'tree', counts, ms: counts.map((n) => n ** k), elements: counts });
const baseline = { recorded: '2026-08-25', exponents: { tree: 1 } };
const check = (rows = [row()], base = baseline, required = ['tree']) =>
	evaluateGrowth(rows, base, required);

describe('growth evidence gate', () => {
	it('fits all four points and retains the historical endpoint comparison', () => {
		expect(growth(row()).fitted).toBeCloseTo(1);
		expect(growth(row(2)).endpoint).toBeCloseTo(2);
		const changed = row();
		changed.ms[1] *= 4;
		expect(growth(changed).fitted).not.toBeCloseTo(growth(row()).fitted);
		expect(growth(changed).endpoint).toBeCloseTo(1);
	});
	it('accepts linear work and rejects both absolute and relative regression', () => {
		expect(check().failures).toEqual([]);
		expect(check([row(2)]).failures).toHaveLength(1);
		expect(check([row(1.4)]).failures).toHaveLength(1);
		expect(check([row(1.29)]).failures).toEqual([]);
	});
	it('rejects missing, extra, duplicate and unknown scenarios', () => {
		expect(() => check([])).toThrow();
		expect(() => check([row(), row()])).toThrow();
		expect(() => check([row(), row()], baseline, ['tree', 'grid'])).toThrow();
		expect(() => check([{ ...row(), name: 'unknown' }])).toThrow();
		expect(() => check([], baseline, [])).toThrow();
	});
	it('rejects missing and malformed baselines', () => {
		expect(() => check([row()], null)).toThrow();
		expect(() => check([row()], { recorded: 'today', exponents: {} })).toThrow();
		expect(() => check([row()], { ...baseline, exponents: { tree: NaN } })).toThrow();
	});
	it('rejects nonfinite, zero, mismatched and unscaled evidence', () => {
		for (const value of [NaN, Infinity, 0, -1]) {
			expect(() => growth({ ...row(), ms: [value, 100, 200, 400] })).toThrow();
		}
		expect(() => growth({ ...row(), counts: [50, 50, 200, 400] })).toThrow();
		expect(() => growth({ ...row(), ms: [1, 2] })).toThrow();
		expect(() => growth({ ...row(), elements: [4, 4, 4, 4] })).toThrow();
	});
});
