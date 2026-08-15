import {
	PopoverBond,
	PopoverBondBase,
	PopoverTriggerAtom,
	PopoverContentAtom,
	type PopoverStateProps
} from '$ixirjs/ui/components/popover/bond.svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import type { CalendarBondProps } from '$ixirjs/ui/components/calendar/bond.svelte';

export type DatePickerBondProps = PopoverStateProps &
	Omit<CalendarBondProps, 'value' | 'start' | 'end'> & {
		value?: Date | undefined;
		start?: Date | undefined;
		end?: Date | undefined;
		format?: string;
		placeholder?: string;
		readonly rest?: Record<string, unknown>;
	};

// Extends PopoverBondBase with date selection (single/range), value formatting, and sub-picker disclosure.

class DatePickerBondBase extends PopoverBondBase<DatePickerBondProps> {
	#isYearsPickerOpen = $state(false);
	#isMonthsPickerOpen = $state(false);

	constructor(props: DatePickerBondProps, name = 'date-picker') {
		super(props, name);
	}

	get formattedValue() {
		if (this.props.type === 'range') {
			if (!this.props.start) return '';
			if (!this.props.end) return this.formatDate(this.props.start);
			return `${this.formatDate(this.props.start)} - ${this.formatDate(this.props.end)}`;
		}

		return this.props.value ? this.formatDate(this.props.value) : '';
	}

	get hasValue() {
		if (this.props.type === 'range') {
			return !!(this.props.start || this.props.end);
		}
		return !!this.props.value;
	}

	get isYearsPickerOpen() {
		return this.#isYearsPickerOpen;
	}

	get isMonthsPickerOpen() {
		return this.#isMonthsPickerOpen;
	}

	selectDate(date: Date) {
		if (this.props.type === 'range') {
			if (!this.props.start) {
				this.props.start = date;
			} else if (!this.props.end) {
				this.props.end = date;
				this.close();
			} else {
				this.props.start = date;
				this.props.end = undefined;
			}
		} else {
			this.props.value = date;
			this.close();
		}
	}

	selectStart(date: Date) {
		this.props.start = date;
	}

	selectEnd(date: Date) {
		this.props.end = date;
		this.close();
	}

	clear() {
		// Commit the coupled value/start/end state once through the range backing.
		this.props.range = [undefined, undefined];
	}

	/** @internal Formatting helper retained for the Bond's derived display value. */
	formatDate(date: Date): string {
		const format = this.props.format ?? 'MM/dd/yyyy';

		// Basic formatting; can be enhanced with date-fns later.
		if (format === 'MM/dd/yyyy') {
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const year = date.getFullYear();
			return `${month}/${day}/${year}`;
		}

		if (format === 'dd/MM/yyyy') {
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const year = date.getFullYear();
			return `${day}/${month}/${year}`;
		}

		if (format === 'yyyy-MM-dd') {
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const year = date.getFullYear();
			return `${year}-${month}-${day}`;
		}

		return date.toLocaleDateString();
	}

	openYearsPicker() {
		this.#isYearsPickerOpen = true;
	}
	closeYearsPicker() {
		this.#isYearsPickerOpen = false;
	}
	toggleYearsPicker() {
		this.#isYearsPickerOpen = !this.#isYearsPickerOpen;
	}

	openMonthsPicker() {
		this.#isMonthsPickerOpen = true;
	}
	closeMonthsPicker() {
		this.#isMonthsPickerOpen = false;
	}
	toggleMonthsPicker() {
		this.#isMonthsPickerOpen = !this.#isMonthsPickerOpen;
	}
}

// Bond shape date-picker atoms type against — breaks the atom↔bond declaration cycle.

// Combobox surface over PopoverTriggerAtom — adds aria-expanded/controls, readonly, and disabled wiring.

class DatePickerTriggerAtom extends PopoverTriggerAtom<DatePickerBondBase> {
	declare protected bond: DatePickerBondBase;

	override get attrs() {
		const isDisabled = this.requireBond().props.disabled ?? false;
		const placeholder = this.requireBond().props.placeholder ?? 'Select a date';

		// aria-expanded, aria-controls, aria-disabled and tabindex come from the overlay trigger
		// policy via role:'trigger' (see super.attrs). They were restated here, and the restated
		// aria-controls rebuilt the content id from the naming convention rather than resolving the
		// registered content Atom.
		return {
			...super.attrs,
			role: 'combobox',
			'aria-label': 'Date picker',
			placeholder,
			disabled: isDisabled,
			readonly: true
		};
	}
}

// Popover content panel relabelled as the date-choosing dialog (role=dialog).
class DatePickerContentAtom extends PopoverContentAtom<DatePickerBondBase> {
	declare protected bond: DatePickerBondBase;

	override get attrs() {
		return {
			...super.attrs,
			role: 'dialog',
			'aria-label': 'Choose date'
		};
	}
}

// Clears value/range; removed from tab order when nothing to clear. Tracked as bond.elements['clear-button'].
class DatePickerClearButtonAtom extends Atom<DatePickerBondBase, HTMLElement> {
	constructor(bond: DatePickerBondBase) {
		super(bond, 'clear-button');
	}

	override get attrs() {
		const hasValue = this.requireBond().hasValue;

		return {
			...super.attrs,
			type: 'button',
			'aria-label': 'Clear date',
			tabindex: hasValue ? 0 : -1
		};
	}

	override get handlers() {
		return {
			onclick: (ev: Event) => {
				ev.preventDefault();
				ev.stopPropagation();
				this.requireBond().clear();
			}
		};
	}
}

// DatePickerBond — flat composition over PopoverBond; overrides trigger/content atoms and adds clear-button.

export const DatePickerBond = defineBond({
	parts: [PopoverBond],
	name: 'date-picker',
	base: DatePickerBondBase,
	preset: 'datepicker',
	atoms: {
		trigger: DatePickerTriggerAtom,
		content: DatePickerContentAtom,
		'clear-button': DatePickerClearButtonAtom
	}
});

// Instance type paired with the const above (value + type same name).
export type DatePickerBond = BondOf<typeof DatePickerBond>;
