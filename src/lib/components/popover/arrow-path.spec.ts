import { describe, expect, it } from 'vitest';
import { createTooltipArrowPath } from './arrow-path';

describe('createTooltipArrowPath', () => {
	it('creates the requested rounded downward arrow path', () => {
		const arrow = createTooltipArrowPath({
			size: 22,
			depth: 12,
			inwardCurve: 5,
			tipSize: 4,
			tipCurve: 2
		});

		expect(arrow).toEqual({
			d: 'M 0 0 C 4.25 0 6.25 9.2 9 10 C 10.4 11.44 10.37 12 11 12 C 11.63 12 11.6 11.44 13 10 C 15.75 9.2 17.75 0 22 0 Z',
			width: 22,
			height: 12,
			viewBox: '0 0 22 12',
			values: {
				size: 22,
				depth: 12,
				inwardCurve: 5,
				tipSize: 4,
				tipCurve: 2
			}
		});
	});

	it('guards against pathological input while keeping the path finite', () => {
		const arrow = createTooltipArrowPath({
			size: -1,
			depth: Infinity,
			inwardCurve: 1_000,
			tipSize: 1_000,
			tipCurve: 1_000,
			precision: 12
		});

		expect(arrow.width).toBe(20);
		expect(arrow.height).toBe(11);
		expect(arrow.viewBox).toBe('0 0 20 11');
		expect(arrow.values).toEqual({
			size: 20,
			depth: 11,
			inwardCurve: 5.51,
			tipSize: 8.4,
			tipCurve: 4.95
		});
		expect(arrow.d).not.toContain('Infinity');
		expect(arrow.d).not.toContain('NaN');
	});
});
