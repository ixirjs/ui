import { Bond, BondState, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import {
	CalendarRootAtom,
	CalendarBodyAtom,
	CalendarHeaderAtom,
	CalendarWeekDayAtom,
	CalendarDayAtom,
	type WeekdayIndex
} from './atoms.svelte';
import type { CalendarRange, Day, Month } from './types';

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
type CalendarBondView = ViewOf<CalendarBondState>;

// Hand-written base for CalendarBond — registers data-driven day/weekDay atoms via registerAtom.
// Static parts (root/body/header) come from the defineBond spec below.
class CalendarBondBase extends Bond<CalendarBondProps, CalendarBondState> {
	// Per-weekday cell atom, cached by index (0=Sunday..6=Saturday).
	weekDay(index: number) {
		const key = `weekday-${index}`;
		this.registerAtom(
			key,
			(b) => new CalendarWeekDayAtom(b as CalendarBondView, index as WeekdayIndex)
		);
		return this.atom(key) as CalendarWeekDayAtom;
	}

	// Per-day cell atom, cached by day.id.
	day(day: Day) {
		const key = `day-${day.id}`;
		this.registerAtom(key, (b) => new CalendarDayAtom(b as CalendarBondView, day));
		return this.atom(key) as CalendarDayAtom;
	}
}

// CalendarBond via defineBond: declares root/body/header atoms; day/weekDay live on the base.
// Selection/navigation logic lives on CalendarBondState.
export const CalendarBond = defineBond<
	{
		root: typeof CalendarRootAtom;
		body: typeof CalendarBodyAtom;
		header: typeof CalendarHeaderAtom;
	},
	CalendarBondState,
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
export type CalendarBond = BondOf<typeof CalendarBond>;

export class CalendarBondState<
	Props extends CalendarBondProps = CalendarBondProps
> extends BondState<Props> {
	constructor(props: Props) {
		super(props);
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
			this.props.pivote = new Date(current.getFullYear(), current.getMonth() + 1, 1);
		}
	}

	previousMonth() {
		if (this.props.pivote) {
			const current = this.props.pivote;
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
