// Pure helpers for time-related input controls — no Svelte reactivity.
export type { SegmentProps, TimeParts, DateTimeParts, LooseParts } from './types';
import type { TimeParts, DateTimeParts } from './types';

// Shallow-merge overrides into base, skipping undefined override values.
export function mergeParts<T extends object>(base: T, overrides: T): T {
	const clean = Object.fromEntries(
		Object.entries(overrides).filter(([, v]) => v !== undefined)
	) as Partial<T>;
	return { ...base, ...clean };
}

// Time helpers

// Parse a HH:MM[:SS] string (always 24h internally) into TimeParts.
export function parseTimeString(str: string, date?: Date, hourFormat: 12 | 24 = 24): TimeParts {
	if (!str) {
		if (date) {
			const h = date.getHours();
			const result: TimeParts = {
				hh: h,
				mm: date.getMinutes(),
				ss: date.getSeconds()
			};
			if (hourFormat === 12) result.period = h >= 12 ? 'PM' : 'AM';
			return result;
		}
		return {};
	}

	const parts = str.split(':');
	const result: TimeParts = {};
	if (parts[0] !== undefined) result.hh = parseInt(parts[0], 10);
	if (parts[1] !== undefined) result.mm = parseInt(parts[1], 10);
	if (parts[2] !== undefined) result.ss = parseInt(parts[2], 10);
	if (hourFormat === 12 && result.hh !== undefined) result.period = result.hh >= 12 ? 'PM' : 'AM';

	return result;
}

// Build a HH:MM[:SS] string from TimeParts. Returns '' if incomplete.
export function buildTimeValue(parts: TimeParts, withSeconds: boolean): string {
	const { hh, mm, ss } = parts;
	if (hh === undefined || mm === undefined) return '';
	const h = String(hh).padStart(2, '0');
	const m = String(mm).padStart(2, '0');
	if (withSeconds) return `${h}:${m}:${String(ss ?? 0).padStart(2, '0')}`;
	return `${h}:${m}`;
}

// Convert 1–12 display hours to 0–23 internal, given current period.
export function displayToInternal(displayH: number, period: 'AM' | 'PM'): number {
	if (period === 'AM') return displayH === 12 ? 0 : displayH;
	return displayH === 12 ? 12 : displayH + 12;
}

// Convert 0–23 internal hours to 1–12 display.
export function internalToDisplay(h: number): number {
	return h % 12 === 0 ? 12 : h % 12;
}

// Seconds since midnight — used for min/max clamping.
function timeToSeconds(h = 0, m = 0, s = 0): number {
	return h * 3600 + m * 60 + s;
}

// Clamp TimeParts to optional min/max strings. Returns clamped parts or original if in range.
export function clampTimeParts(parts: TimeParts, min?: string, max?: string): TimeParts {
	const { hh, mm, ss } = parts;
	if (hh === undefined || mm === undefined) return parts;

	const secs = timeToSeconds(hh, mm, ss);

	if (min) {
		const mp = parseTimeString(min);
		if (mp.hh !== undefined && secs < timeToSeconds(mp.hh, mp.mm, mp.ss)) {
			const r: TimeParts = { hh: mp.hh };
			if (mp.mm !== undefined) r.mm = mp.mm;
			if (mp.ss !== undefined) r.ss = mp.ss;
			if (parts.period) r.period = parts.period;
			return r;
		}
	}

	if (max) {
		const mp = parseTimeString(max);
		if (mp.hh !== undefined && secs > timeToSeconds(mp.hh, mp.mm, mp.ss)) {
			const r: TimeParts = { hh: mp.hh };
			if (mp.mm !== undefined) r.mm = mp.mm;
			if (mp.ss !== undefined) r.ss = mp.ss;
			if (parts.period) r.period = parts.period;
			return r;
		}
	}

	return parts;
}

// DateTime helpers

// Parse a YYYY-MM-DD string into DateTimeParts (date-only, no time fields).
export function parseDateString(str: string): DateTimeParts {
	if (!str) return {};
	const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return {};
	return {
		year: parseInt(m[1]!, 10),
		month: parseInt(m[2]!, 10),
		day: parseInt(m[3]!, 10)
	};
}

// Build a YYYY-MM-DD string from DateTimeParts. Returns '' if incomplete.
export function buildDateValue(parts: DateTimeParts): string {
	const { year, month, day } = parts;
	if (year === undefined || month === undefined || day === undefined) return '';
	const pad = (n: number, len = 2) => String(n).padStart(len, '0');
	return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

// Parse a YYYY-MM-DDTHH:MM[:SS] string into DateTimeParts.
export function parseDateTimeString(str: string): DateTimeParts {
	if (!str) return {};
	const m = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
	if (!m) return {};
	return {
		year: parseInt(m[1]!, 10),
		month: parseInt(m[2]!, 10),
		day: parseInt(m[3]!, 10),
		hours: parseInt(m[4]!, 10),
		minutes: parseInt(m[5]!, 10),
		...(m[6] ? { seconds: parseInt(m[6], 10) } : {})
	};
}

// Build a YYYY-MM-DDTHH:MM[:SS] string from DateTimeParts. Returns '' if incomplete.
export function buildDateTimeValue(parts: DateTimeParts, withSeconds: boolean): string {
	const { year, month, day, hours, minutes, seconds } = parts;
	if (
		year === undefined ||
		month === undefined ||
		day === undefined ||
		hours === undefined ||
		minutes === undefined
	)
		return '';

	const pad = (n: number, len = 2) => String(n).padStart(len, '0');
	const base = `${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}`;
	return withSeconds ? `${base}:${pad(seconds ?? 0)}` : base;
}

// Max days in a given month/year (falls back to year 2000 if year unknown).
export function maxDaysInMonth(month?: number, year?: number): number {
	if (!month) return 31;
	return new Date(year ?? 2000, month, 0).getDate();
}

// Rollover arithmetic — one copy each, shared by every `onrollover` handler in time-control and
// datetime-control. Both were written out inline three to six times.

// Step one unit past a bound and wrap. An unset value starts at the bound it is stepping away from,
// so the first ArrowUp on an empty minute segment gives 1 and the first ArrowDown gives 58.
export function stepWrap(cur: number | undefined, min: number, max: number, dir: 1 | -1): number {
	const from = cur ?? (dir === 1 ? min : max);
	if (dir === 1) return from >= max ? min : from + 1;
	return from <= min ? max : from - 1;
}

export type CalendarParts = {
	year?: number | undefined;
	month?: number | undefined;
	day?: number | undefined;
};

// Move the month by one, carrying the year.
export function addMonth(
	parts: CalendarParts,
	dir: 1 | -1,
	fallbackYear: number
): { year: number; month: number } {
	let year = parts.year ?? fallbackYear;
	let month = (parts.month ?? 1) + dir;
	if (month > 12) {
		month = 1;
		year++;
	}
	if (month < 1) {
		month = 12;
		year--;
	}
	return { year, month };
}

// Move the day by one, carrying month and year. Stepping back into the previous month lands on that
// month's real last day — including February of the year actually carried into.
export function addDay(
	parts: CalendarParts,
	dir: 1 | -1,
	fallbackYear: number
): { year: number; month: number; day: number } {
	const year = parts.year ?? fallbackYear;
	const month = parts.month ?? 1;
	const day = (parts.day ?? 1) + dir;

	if (day > maxDaysInMonth(month, year)) {
		return { ...addMonth({ year, month }, 1, fallbackYear), day: 1 };
	}
	if (day < 1) {
		const prev = addMonth({ year, month }, -1, fallbackYear);
		return { ...prev, day: maxDaysInMonth(prev.month, prev.year) };
	}
	return { year, month, day };
}

/** Carry a wrapped clock segment through every higher date/time unit. */
export function carryDateTime(
	parts: DateTimeParts,
	rolled: 'seconds' | 'minutes' | 'hours',
	dir: 1 | -1,
	fallbackYear: number
): DateTimeParts {
	const date = new Date(0);
	date.setUTCFullYear(parts.year ?? fallbackYear, (parts.month ?? 1) - 1, parts.day ?? 1);
	date.setUTCHours(parts.hours ?? 0, parts.minutes ?? 0, parts.seconds ?? 0, 0);

	if (rolled === 'seconds') date.setUTCMinutes(date.getUTCMinutes() + dir);
	else if (rolled === 'minutes') date.setUTCHours(date.getUTCHours() + dir);
	else date.setUTCDate(date.getUTCDate() + dir);

	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate(),
		hours: date.getUTCHours(),
		minutes: date.getUTCMinutes(),
		seconds: date.getUTCSeconds()
	};
}
