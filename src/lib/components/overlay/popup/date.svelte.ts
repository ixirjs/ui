import type { DatePickerBondProps } from '$ixirjs/ui/components/date-picker/bond.svelte';

/** Date policy, not another Bond. Storage and callbacks remain in the existing DatePicker root. */
export function createDateState(
	props: DatePickerBondProps,
	close: () => void,
	display: (date: Date) => string
) {
	let yearsOpen = $state(false);
	let monthsOpen = $state(false);
	function formatDate(date: Date): string {
		const format = props.format ?? 'MM/dd/yyyy';
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const year = date.getFullYear();
		if (format === 'MM/dd/yyyy') return `${month}/${day}/${year}`;
		if (format === 'dd/MM/yyyy') return `${day}/${month}/${year}`;
		if (format === 'yyyy-MM-dd') return `${year}-${month}-${day}`;
		return date.toLocaleDateString();
	}
	return {
		get formattedValue() {
			if (props.type === 'range') {
				if (!props.start) return '';
				if (!props.end) return display(props.start);
				return `${display(props.start)} - ${display(props.end)}`;
			}
			return props.value ? display(props.value) : '';
		},
		get hasValue() {
			return props.type === 'range' ? !!(props.start || props.end) : !!props.value;
		},
		get isYearsPickerOpen() {
			return yearsOpen;
		},
		get isMonthsPickerOpen() {
			return monthsOpen;
		},
		formatDate,
		selectDate(date: Date) {
			if (props.type === 'range') {
				if (!props.start) props.start = date;
				else if (!props.end) {
					props.end = date;
					close();
				} else {
					props.start = date;
					props.end = undefined;
				}
			} else {
				props.value = date;
				close();
			}
		},
		selectStart(date: Date) {
			props.start = date;
		},
		selectEnd(date: Date) {
			props.end = date;
			close();
		},
		clear() {
			props.range = [undefined, undefined];
		},
		openYearsPicker() {
			yearsOpen = true;
		},
		closeYearsPicker() {
			yearsOpen = false;
		},
		toggleYearsPicker() {
			yearsOpen = !yearsOpen;
		},
		openMonthsPicker() {
			monthsOpen = true;
		},
		closeMonthsPicker() {
			monthsOpen = false;
		},
		toggleMonthsPicker() {
			monthsOpen = !monthsOpen;
		}
	};
}
