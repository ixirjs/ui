import {
	PopoverBond,
	PopoverBondBase,
	PopoverTriggerAtom,
	PopoverContentAtom,
	type PopoverDomElements,
	type PopoverStateProps
} from '$ixirjs/ui/components/popover/bond.svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { getElementId } from '$ixirjs/ui/utils/dom.svelte';
import type { CalendarBondProps } from '$ixirjs/ui/components/calendar/bond.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DatePickerBondProps = PopoverStateProps &
	Omit<CalendarBondProps, 'value' | 'start' | 'end'> & {
		value?: Date | undefined;
		start?: Date | undefined;
		end?: Date | undefined;
		format?: string;
		placeholder?: string;
		readonly rest?: Record<string, unknown>;
	};

export type DatePickerBondElements = PopoverDomElements & {
	trigger: HTMLInputElement;
	root: HTMLElement;
	content: HTMLElement;
	'clear-button': HTMLElement;
};

// Extends PopoverBondBase with date selection (single/range), value formatting, and sub-picker disclosure.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DatePickerBondView = DatePickerBondBase;

// Combobox surface over PopoverTriggerAtom — adds aria-expanded/controls, readonly, and disabled wiring.

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class DatePickerTriggerAtom extends PopoverTriggerAtom<DatePickerBondView> {
	declare protected bond: DatePickerBondView;

	override get attrs() {
		const isDisabled = this.requireBond().props.disabled ?? false;
		const placeholder = this.requireBond().props.placeholder ?? 'Select a date';
		const contentId = getElementId(
			this.requireBond().id,
			`${this.requireBond().namespace}-content`
		);

		return {
			...super.attrs,
			role: 'combobox',
			'aria-expanded': this.requireBond().isOpen,
			'aria-controls': contentId,
			'aria-label': 'Date picker',
			'aria-disabled': isDisabled,
			placeholder,
			disabled: isDisabled,
			readonly: true,
			tabindex: isDisabled ? -1 : 0
		};
	}
}

// Popover content panel relabelled as the date-choosing dialog (role=dialog).
export class DatePickerContentAtom extends PopoverContentAtom<DatePickerBondView> {
	declare protected bond: DatePickerBondView;

	override get attrs() {
		return {
			...super.attrs,
			role: 'dialog',
			'aria-label': 'Choose date'
		};
	}
}

// Clears value/range; removed from tab order when nothing to clear. Tracked as bond.elements['clear-button'].
export class DatePickerClearButtonAtom extends Atom<DatePickerBondView, HTMLElement> {
	constructor(bond: DatePickerBondView) {
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

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

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
