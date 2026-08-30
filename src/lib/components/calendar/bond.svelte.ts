/**
 * Calendar's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ calendar }`, `getBond`, `factory`, `selectStart`/`selectEnd`,
 * `nextMonth`/`previousMonth`, `isDaySelected`), none of the runtime. The root owns the bindables and
 * wires how a new range or pivote is written through `bindCommit`; the parts read the element ids
 * from here — the historic `calendar-month-*` / `calendar-weekdays-*` names included.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { BondStateProps } from '$ixirjs/ui/authoring';
import type { CalendarRange, Day, Month } from './types';

export type CalendarBondProps = BondStateProps & {
	value?: Date | undefined;
	range: CalendarRange;
	start?: Date | undefined;
	end?: Date | undefined;
	min?: Date | undefined;
	max?: Date | undefined;
	pivote?: Date | undefined;
	disabled?: boolean;
	type?: 'range' | 'single' | undefined;
	currentMonth?: Month | undefined;
	previousMonth?: Month | undefined;
	nextMonth?: Month | undefined;
	extend?: Record<string, unknown> | undefined;
};

export const CalendarContext = Kernel.context<CalendarBond>('bond/calendar');

/** @internal How the root writes a committed range or pivote back into its bindables. */
export type CalendarCommit = {
	range(next: CalendarRange): void;
	pivote(next: Date): void;
};

export class CalendarBond {
	static readonly CONTEXT_KEY = CalendarContext.key;
	static get(): CalendarBond | undefined {
		return CalendarContext.get();
	}
	static getOrThrow(message?: string): CalendarBond {
		return CalendarContext.getOrThrow(message);
	}
	static create(props: CalendarBondProps): CalendarBond {
		return new CalendarBond(props);
	}

	readonly name = 'calendar';
	readonly props: CalendarBondProps;
	#commit: CalendarCommit | undefined;

	constructor(props: CalendarBondProps) {
		this.props = props;
	}

	/** @internal The root wires how a new range or pivote is written and reported. */
	bindCommit(commit: CalendarCommit): void {
		this.#commit = commit;
	}

	get id(): string {
		return this.props.id ?? this.name;
	}
	get rootId(): string {
		return Kernel.id(this.id, 'calendar-root');
	}
	get headerId(): string {
		return Kernel.id(this.id, 'calendar-weekdays');
	}
	get bodyId(): string {
		return Kernel.id(this.id, 'calendar-month');
	}
	weekdayId(index: number): string {
		return Kernel.id(this.id, `calendar-weekday-${index}`);
	}
	dayId(day: Day): string {
		return Kernel.id(this.id, `calendar-day-${day.id}`);
	}

	#setRange(next: CalendarRange): void {
		this.#commit?.range(next);
	}

	selectDate(date: Date): void {
		if (!this.props.start) this.#setRange([date, this.props.range[1]]);
		else if (!this.props.end) this.#setRange([this.props.range[0], date]);
		else this.#setRange([date, undefined]);
	}
	selectStart(date: Date): void {
		this.#setRange([date, this.props.range[1]]);
	}
	selectEnd(date: Date): void {
		this.#setRange([this.props.range[0], date]);
	}
	unselect(): void {
		this.#setRange([undefined, undefined]);
	}
	unselectStart(): void {
		this.#setRange([undefined, this.props.range[1]]);
	}
	unselectEnd(): void {
		this.#setRange([this.props.range[0], undefined]);
	}

	#shiftMonth(by: number): void {
		const current = this.props.pivote;
		if (!current) return;
		// Assigned wholesale to the reactive prop cell (never mutated in place) — a plain Date is correct here.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		this.#commit?.pivote(new Date(current.getFullYear(), current.getMonth() + by, 1));
	}
	nextMonth(): void {
		this.#shiftMonth(1);
	}
	previousMonth(): void {
		this.#shiftMonth(-1);
	}

	isDaySelected(day: Day): boolean {
		if (this.props.type !== 'range') {
			return this.props.value?.getTime() === day.date.getTime();
		}
		const [start, end] = this.props.range;
		if (!start) return false;
		const dayTime = day.date.getTime();
		const startTime = start.getTime();
		if (!end) return dayTime === startTime;
		return dayTime >= startTime && dayTime <= end.getTime();
	}
}
