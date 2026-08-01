/** Focused local-date operations used by Calendar/DatePicker. */

export function startOfDay(value: Date): Date {
	return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function isSameDay(left: Date, right: Date): boolean {
	return (
		left.getFullYear() === right.getFullYear() &&
		left.getMonth() === right.getMonth() &&
		left.getDate() === right.getDate()
	);
}

export function isToday(value: Date): boolean {
	return isSameDay(value, new Date());
}

export function isBefore(left: Date, right: Date): boolean {
	return left.getTime() < right.getTime();
}

export function isWithinInterval(value: Date, interval: { start: Date; end: Date }): boolean {
	const time = value.getTime();
	const start = interval.start.getTime();
	const end = interval.end.getTime();
	if (start > end) throw new RangeError('Invalid interval: start must not follow end.');
	return time >= start && time <= end;
}

export function getYear(value: Date): number {
	return value.getFullYear();
}

export function getMonth(value: Date): number {
	return value.getMonth();
}

export function setMonth(value: Date, month: number): Date {
	const result = new Date(value);
	const day = result.getDate();
	result.setDate(1);
	result.setMonth(month);
	result.setDate(Math.min(day, daysInMonth(result.getFullYear(), result.getMonth())));
	return result;
}

export function setYear(value: Date, year: number): Date {
	const result = new Date(value);
	const month = result.getMonth();
	const day = result.getDate();
	result.setDate(1);
	result.setFullYear(year);
	result.setMonth(month);
	result.setDate(Math.min(day, daysInMonth(year, month)));
	return result;
}

export function addDays(value: Date, amount: number): Date {
	const result = new Date(value);
	result.setDate(result.getDate() + amount);
	return result;
}

/** Whole local days between the two dates, ignoring the time of day. */
export function differenceInCalendarDays(left: Date, right: Date): number {
	const days = (startOfDay(left).getTime() - startOfDay(right).getTime()) / 86_400_000;
	return Math.round(days);
}

export function addMonths(value: Date, amount: number): Date {
	return setMonth(value, value.getMonth() + amount);
}

export function subMonths(value: Date, amount: number): Date {
	return addMonths(value, -amount);
}

const MONTH_SHORT = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NARROW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Closed formatter for the four patterns used by the built-in Calendar. */
export function format(value: Date, pattern: 'MM' | 'MMM' | 'iii' | 'iiiii'): string {
	switch (pattern) {
		case 'MM':
			return String(value.getMonth() + 1).padStart(2, '0');
		case 'MMM':
			return MONTH_SHORT[value.getMonth()]!;
		case 'iii':
			return DAY_SHORT[value.getDay()]!;
		case 'iiiii':
			return DAY_NARROW[value.getDay()]!;
	}
}

function daysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}
