import { BondAtom } from '$svelte-atoms/core/shared';
import type { ViewOf } from '$svelte-atoms/core/shared';
import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import type { CalendarBondState } from './bond.svelte';
import type { Day } from './types';

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Bond shape the calendar atoms type this.bond against — breaks the atom↔bond cycle.
type CalendarBondView = ViewOf<CalendarBondState>;

export class CalendarRootAtom extends BondAtom<CalendarBondView> {
	constructor(bond: CalendarBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		// super.attrs already yields id `calendar-root-${id}` (kind === 'calendar-root').
		return {
			...super.attrs,
			role: 'application',
			'aria-label': 'Calendar',
			'aria-disabled': this.bond.state.props.disabled ?? false
		};
	}
}

export class CalendarBodyAtom extends BondAtom<CalendarBondView> {
	constructor(bond: CalendarBondView) {
		super(bond, 'body');
	}

	override get attrs() {
		// Preserves the historic ids (`calendar-month-*`), distinct from the natural `calendar-body`.
		return {
			...super.attrs,
			id: getElementId(this.bond.id, 'calendar-month'),
			role: 'grid',
			'aria-labelledby': getElementId(this.bond.id, 'calendar-month-label')
		};
	}

	// Future: keyboard navigation handlers (arrow keys → state.focusedDay)
	// will live here, via a rovingCalendarGrid(bond) helper — see CONTEXT.md
	// §RovingTabindex.
}

export class CalendarHeaderAtom extends BondAtom<CalendarBondView> {
	constructor(bond: CalendarBondView) {
		super(bond, 'header');
	}

	override get attrs() {
		// Preserves the historic id (`calendar-weekdays-*`), distinct from the natural `calendar-header`.
		return {
			...super.attrs,
			id: getElementId(this.bond.id, 'calendar-weekdays'),
			role: 'row'
		};
	}
}

// Data-driven atom cached by weekday index (0–6); each index gets a distinct id to avoid the old shared-id bug.
export class CalendarWeekDayAtom extends BondAtom<CalendarBondView> {
	readonly weekDayIndex: WeekdayIndex;

	constructor(bond: CalendarBondView, weekDayIndex: WeekdayIndex) {
		super(bond, `weekday-${weekDayIndex}`);
		this.weekDayIndex = weekDayIndex;
	}

	override get attrs() {
		return {
			...super.attrs,
			'data-kind': 'calendar-weekday',
			role: 'columnheader'
		};
	}
}

// Data-driven atom cached by day.id; carries ARIA attrs so consumers spread directly.
// Subclass and override attrs to extend (e.g. holiday rendering).
export class CalendarDayAtom extends BondAtom<CalendarBondView> {
	readonly day: Day;

	constructor(bond: CalendarBondView, day: Day) {
		super(bond, `day-${day.id}`);
		this.day = day;
	}

	override get attrs() {
		return {
			...super.attrs,
			'data-kind': 'calendar-day',
			role: 'gridcell',
			'aria-selected': this.bond.state.isDaySelected(this.day),
			'aria-disabled': this.day.disabled,
			tabindex: this.day.disabled ? -1 : 0
		};
	}
}
