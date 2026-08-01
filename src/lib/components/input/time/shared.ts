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
export function timeToSeconds(h = 0, m = 0, s = 0): number {
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
