import { describe, expect, it } from 'vitest';
import {
	addDay,
	addMonth,
	buildDateTimeValue,
	buildDateValue,
	buildTimeValue,
	carryDateTime,
	clampTimeParts,
	displayToInternal,
	internalToDisplay,
	maxDaysInMonth,
	mergeParts,
	parseDateString,
	parseDateTimeString,
	parseTimeString,
	stepWrap
} from '$ixirjs/ui/components/input/time/shared';

describe('time parts', () => {
	it('parses and rebuilds HH:MM[:SS], dropping seconds when not requested', () => {
		expect(parseTimeString('09:05')).toEqual({ hh: 9, mm: 5 });
		expect(parseTimeString('09:05:07')).toEqual({ hh: 9, mm: 5, ss: 7 });
		expect(parseTimeString('')).toEqual({});

		expect(buildTimeValue({ hh: 9, mm: 5, ss: 7 }, false)).toBe('09:05');
		expect(buildTimeValue({ hh: 9, mm: 5, ss: 7 }, true)).toBe('09:05:07');
		// Seconds default to 00 rather than making the whole value incomplete.
		expect(buildTimeValue({ hh: 9, mm: 5 }, true)).toBe('09:05:00');
		// Missing minutes is incomplete — no partial string.
		expect(buildTimeValue({ hh: 9 }, false)).toBe('');
	});

	it('derives the period only in 12-hour mode, at the noon boundary', () => {
		expect(parseTimeString('11:59', undefined, 12).period).toBe('AM');
		expect(parseTimeString('12:00', undefined, 12).period).toBe('PM');
		expect(parseTimeString('12:00', undefined, 24).period).toBeUndefined();
	});

	it('seeds from a Date when the string is empty', () => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const at = new Date(2026, 0, 1, 13, 45, 30);
		expect(parseTimeString('', at)).toEqual({ hh: 13, mm: 45, ss: 30 });
		expect(parseTimeString('', at, 12).period).toBe('PM');
	});

	it('round-trips display and internal hours across both midnights', () => {
		expect(displayToInternal(12, 'AM')).toBe(0);
		expect(displayToInternal(12, 'PM')).toBe(12);
		expect(displayToInternal(1, 'PM')).toBe(13);
		expect(displayToInternal(1, 'AM')).toBe(1);

		for (let h = 0; h < 24; h++) {
			const display = internalToDisplay(h);
			expect(display).toBeGreaterThanOrEqual(1);
			expect(display).toBeLessThanOrEqual(12);
			expect(displayToInternal(display, h >= 12 ? 'PM' : 'AM')).toBe(h);
		}
	});

	it('clamps to min and max, and leaves an in-range time alone', () => {
		const parts = { hh: 8, mm: 0 };
		expect(clampTimeParts(parts, '09:00')).toEqual({ hh: 9, mm: 0 });
		expect(clampTimeParts({ hh: 23, mm: 0 }, undefined, '17:30')).toEqual({ hh: 17, mm: 30 });
		expect(clampTimeParts({ hh: 12, mm: 0 }, '09:00', '17:30')).toEqual({ hh: 12, mm: 0 });
		// Incomplete parts pass through untouched rather than snapping to a bound.
		expect(clampTimeParts({ hh: 8 }, '09:00')).toEqual({ hh: 8 });
	});

	it('merges overrides but ignores undefined ones', () => {
		expect(mergeParts({ hh: 9, mm: 5 }, { hh: 10, mm: undefined })).toEqual({ hh: 10, mm: 5 });
	});
});

describe('date and datetime parts', () => {
	it('round-trips YYYY-MM-DD', () => {
		expect(parseDateString('2026-02-09')).toEqual({ year: 2026, month: 2, day: 9 });
		expect(buildDateValue({ year: 2026, month: 2, day: 9 })).toBe('2026-02-09');
		// Anything that is not exactly the ISO date shape is not a date.
		expect(parseDateString('2026-2-9')).toEqual({});
		expect(buildDateValue({ year: 2026, month: 2 })).toBe('');
	});

	it('round-trips YYYY-MM-DDTHH:MM[:SS]', () => {
		expect(parseDateTimeString('2026-02-09T13:45')).toEqual({
			year: 2026,
			month: 2,
			day: 9,
			hours: 13,
			minutes: 45
		});
		expect(parseDateTimeString('2026-02-09T13:45:30').seconds).toBe(30);

		const parts = { year: 2026, month: 2, day: 9, hours: 13, minutes: 45, seconds: 30 };
		expect(buildDateTimeValue(parts, false)).toBe('2026-02-09T13:45');
		expect(buildDateTimeValue(parts, true)).toBe('2026-02-09T13:45:30');
		expect(buildDateTimeValue({ year: 2026, month: 2, day: 9 }, false)).toBe('');
	});

	it('knows February in a leap year and out of it', () => {
		expect(maxDaysInMonth(2, 2024)).toBe(29);
		expect(maxDaysInMonth(2, 2026)).toBe(28);
		expect(maxDaysInMonth(1, 2026)).toBe(31);
		expect(maxDaysInMonth(4, 2026)).toBe(30);
		// No month yet — assume the longest, so a typed day is never rejected early.
		expect(maxDaysInMonth(undefined, 2026)).toBe(31);
	});
});

describe('rollover arithmetic', () => {
	it('wraps a segment past its bound, and starts an unset one at the far bound', () => {
		expect(stepWrap(58, 0, 59, 1)).toBe(59);
		expect(stepWrap(59, 0, 59, 1)).toBe(0);
		expect(stepWrap(0, 0, 59, -1)).toBe(59);
		// 12-hour hours run 1–12, not 0–11.
		expect(stepWrap(12, 1, 12, 1)).toBe(1);
		// Unset: the first ArrowUp reads as one past the minimum, ArrowDown as one below the max.
		expect(stepWrap(undefined, 0, 59, 1)).toBe(1);
		expect(stepWrap(undefined, 0, 59, -1)).toBe(58);
	});

	it('carries wrapped clock segments through midnight and the year', () => {
		expect(
			carryDateTime(
				{ year: 2026, month: 12, day: 31, hours: 23, minutes: 59, seconds: 0 },
				'seconds',
				1,
				2026
			)
		).toEqual({ year: 2027, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0 });
		expect(
			carryDateTime(
				{ year: 2026, month: 1, day: 1, hours: 0, minutes: 0, seconds: 59 },
				'minutes',
				-1,
				2026
			)
		).toEqual({ year: 2025, month: 12, day: 31, hours: 23, minutes: 0, seconds: 59 });
	});

	it('carries the day into the month and the month into the year', () => {
		expect(addDay({ year: 2026, month: 1, day: 31 }, 1, 2026)).toEqual({
			year: 2026,
			month: 2,
			day: 1
		});
		expect(addDay({ year: 2026, month: 1, day: 1 }, -1, 2026)).toEqual({
			year: 2025,
			month: 12,
			day: 31
		});
		// Stepping back into February lands on the last day of the year actually carried into.
		expect(addDay({ year: 2024, month: 3, day: 1 }, -1, 2026)).toEqual({
			year: 2024,
			month: 2,
			day: 29
		});
		expect(addMonth({ year: 2026, month: 12 }, 1, 2026)).toEqual({ year: 2027, month: 1 });
		expect(addMonth({ year: 2026, month: 1 }, -1, 2026)).toEqual({ year: 2025, month: 12 });
		// Nothing typed yet — the fallback year stands in.
		expect(addMonth({}, 1, 2026)).toEqual({ year: 2026, month: 2 });
	});
});
