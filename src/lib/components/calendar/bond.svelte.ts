import { Bond, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	CalendarRootAtom,
	CalendarBodyAtom,
	CalendarHeaderAtom,
	CalendarWeekDayAtom,
	CalendarDayAtom,
	type WeekdayIndex
} from './atoms.svelte';
import type { CalendarRange, Day, Month } from './types';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type CalendarBondProps = BondStateProps & {
	value?: Date;
	range: CalendarRange;
	start?: Date;
	end?: Date;
	min?: Date;
	max?: Date;
	pivote?: Date;
	disabled?: boolean;
	type?: 'range' | 'single';
	currentMonth?: Month;
	previousMonth?: Month;
	nextMonth?: Month;
	extend?: Record<string, unknown>;
};

export type CalendarBondElements = {
	root: HTMLElement;
	body: HTMLElement;
	day: HTMLElement;
	weekDay: HTMLElement;
	header: HTMLElement;
};

// Bond shape the calendar atoms type this.bond against — breaks the atom↔bond cycle.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type CalendarBondView = CalendarBondBase;

// Hand-written base for CalendarBond — creates data-driven day/weekDay atoms.
// Static parts (root/body/header) come from the defineBond spec below.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class CalendarBondBase extends Bond<CalendarBondProps> {
	constructor(props: CalendarBondProps, name = 'calendar') {
		super(props, name);
	}

	// Per-weekday cell atom, cached by index (0=Sunday..6=Saturday).
	weekDay(index: number) {
		return new CalendarWeekDayAtom(this as CalendarBondView, index as WeekdayIndex);
	}

	// Per-day cell atom, cached by day.id.
	day(day: Day) {
		return new CalendarDayAtom(this as CalendarBondView, day);
	}

	selectDate(date: Date) {
		if (!this.props.start) {
			this.props.range[0] = date;
		} else if (!this.props.end) {
			this.props.range[1] = date;
		} else {
			this.props.range[0] = date;
			this.props.range[1] = undefined;
		}

		this.props.range = [...this.props.range];
	}

	selectStart(date: Date) {
		this.props.range[0] = date;
		this.props.range = [...this.props.range];
	}

	selectEnd(date: Date) {
		this.props.range[1] = date;
		this.props.range = [...this.props.range];
	}

	unselect() {
		this.props.range = [undefined, undefined];
		this.props.range = [...this.props.range];
	}

	unselectStart() {
		this.props.range[0] = undefined;
		this.props.range = [...this.props.range];
	}

	unselectEnd() {
		this.props.range[1] = undefined;
		this.props.range = [...this.props.range];
	}

	nextMonth() {
		if (this.props.pivote) {
			const current = this.props.pivote;
			// Assigned wholesale to the reactive prop cell (never mutated in place) — a plain Date is correct here.
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			this.props.pivote = new Date(current.getFullYear(), current.getMonth() + 1, 1);
		}
	}

	previousMonth() {
		if (this.props.pivote) {
			const current = this.props.pivote;
			// Assigned wholesale to the reactive prop cell (never mutated in place) — a plain Date is correct here.
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			this.props.pivote = new Date(current.getFullYear(), current.getMonth() - 1, 1);
		}
	}

	isDaySelected(day: Day): boolean {
		if (this.props.range) {
			const start = this.props.range[0];
			const end = this.props.range[1];

			if (!start) return false;

			const dayTime = day.date.getTime();
			const startTime = start.getTime();

			if (!end) return dayTime === startTime;

			const endTime = end.getTime();
			return dayTime >= startTime && dayTime <= endTime;
		}

		return this.props.value?.getTime() === day.date.getTime();
	}
}

// CalendarBond via defineBond: declares root/body/header atoms; day/weekDay live on the base.
// Selection/navigation logic lives on CalendarBondBase.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const CalendarBondImpl = defineBond<
	{
		root: typeof CalendarRootAtom;
		body: typeof CalendarBodyAtom;
		header: typeof CalendarHeaderAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof CalendarBondBase
>({
	name: 'calendar',
	base: CalendarBondBase,
	atoms: {
		root: CalendarRootAtom,
		body: CalendarBodyAtom,
		header: CalendarHeaderAtom
	}
});

// Instance type — paired with the const above (value + type).
export type CalendarBond = BondOf<typeof CalendarBondImpl>;

interface CalendarBondConstructor {
	new (props: CalendarBondProps): CalendarBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof CalendarBondImpl)['spec'];
	get(): CalendarBond | undefined;
	getOrThrow(message?: string): CalendarBond;
	set(bond: CalendarBond): CalendarBond;
	create(props: CalendarBondProps): CalendarBond;
}

export const CalendarBond = CalendarBondImpl as unknown as CalendarBondConstructor;
