/**
 * DatePicker's shared object on the redesigned `Kernel` — a plain state class over Popover's.
 *
 * The family is a Popover whose content is a Calendar, so `DatePickerBond extends PopoverBondBase`
 * and the root shares it under the DatePicker, Popover and Overlay context keys: `Popover.Tail` and
 * `Popover.Indicator` are re-exported as `DatePicker.Tail`/`DatePicker.Indicator` and read the same
 * object, exactly as the flat `defineBond({ parts: [PopoverBond] })` composition used to arrange.
 *
 * The trigger/content ARIA the old `DatePickerTriggerAtom`/`DatePickerContentAtom` projected is now
 * written literally by `date-picker-trigger.svelte` and by `date-picker-calendar.svelte`'s props on
 * `Popover.Content`. `name` stays `'date-picker'` so every element id is the one the family always
 * rendered (`date-picker-trigger-<seed>`); the preset keys stay under `datepicker.*`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { PopoverBondBase, type PopoverBondProps } from '$ixirjs/ui/components/popover/bond.svelte';
import type { OverlayBond, OverlayLike } from '$ixirjs/ui/components/overlay/model.svelte';
import type { CalendarBondProps } from '$ixirjs/ui/components/calendar/bond.svelte';
import type { DatePickerPresets } from './types';

export type DatePickerBondProps = Omit<PopoverBondProps, 'presets'> &
	Omit<CalendarBondProps, 'value' | 'start' | 'end' | 'presets'> & {
		value?: Date | undefined;
		start?: Date | undefined;
		end?: Date | undefined;
		format?: string;
		placeholder?: string;
		presets?: DatePickerPresets | undefined;
		readonly rest?: Record<string, unknown>;
	};

export const DatePickerContext = Kernel.context<DatePickerBond>('bond/date-picker');

// Popover disclosure + date selection (single/range), value formatting, and the two sub-picker
// disclosures the calendar header opens.
export class DatePickerBond extends PopoverBondBase<DatePickerBondProps> {
	static readonly CONTEXT_KEY = DatePickerContext.key;
	static get(): DatePickerBond | undefined {
		return DatePickerContext.get();
	}
	static getOrThrow(message?: string): DatePickerBond {
		return DatePickerContext.getOrThrow(message);
	}
	// The second overload only keeps the static side compatible with `OverlayBond.create(outer?)`,
	// the host-delegating constructor this family never calls.
	static override create(props: DatePickerBondProps): DatePickerBond;
	static override create(outer?: OverlayLike): OverlayBond;
	static override create(props?: DatePickerBondProps | OverlayLike): OverlayBond {
		return new DatePickerBond(props as DatePickerBondProps);
	}

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
