import { describe, expect, it } from 'vitest';
import {
	addDays,
	addMonths,
	differenceInCalendarDays,
	format,
	isSameDay,
	isWithinInterval,
	setMonth,
	setYear,
	startOfDay
} from './date';

describe('local date kernel', () => {
	it('clamps month and year changes at the target month boundary', () => {
		expect(setMonth(new Date(2024, 0, 31, 12), 1).getDate()).toBe(29);
		expect(addMonths(new Date(2023, 0, 31, 12), 1).getDate()).toBe(28);
		expect(setYear(new Date(2024, 1, 29, 12), 2023).getDate()).toBe(28);
	});

	it('preserves local-day and inclusive interval semantics', () => {
		const day = new Date(2025, 5, 4, 18, 30);
		expect(startOfDay(day)).toEqual(new Date(2025, 5, 4));
		expect(isSameDay(day, new Date(2025, 5, 4, 1))).toBe(true);
		expect(isWithinInterval(day, { start: new Date(2025, 5, 4), end: day })).toBe(true);
	});

	it('counts calendar days across a month boundary and a DST shift', () => {
		expect(addDays(new Date(2025, 0, 31, 12), 1)).toEqual(new Date(2025, 1, 1, 12));
		expect(differenceInCalendarDays(new Date(2025, 1, 1), new Date(2025, 0, 31))).toBe(1);
		// US DST forward is 2025-03-09; the 23-hour day must still count as one.
		expect(differenceInCalendarDays(new Date(2025, 2, 10), new Date(2025, 2, 8))).toBe(2);
		expect(differenceInCalendarDays(new Date(2025, 0, 1), new Date(2025, 0, 5))).toBe(-4);
	});

	it('formats the closed Calendar token set', () => {
		const sunday = new Date(2025, 0, 5);
		expect(['01', 'Jan', 'Sun', 'S']).toEqual([
			format(sunday, 'MM'),
			format(sunday, 'MMM'),
			format(sunday, 'iii'),
			format(sunday, 'iiiii')
		]);
	});
});
