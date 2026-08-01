<script lang="ts" module>
	import type { CalendarBond as CalendarBondInstance } from '$ixirjs/ui/components/calendar/bond.svelte';
	import type { DatePickerBond as DatePickerBondInstance } from '$ixirjs/ui/components/date-picker/bond.svelte';

	export let capturedCalendarBond: CalendarBondInstance | undefined;
	export let capturedDatePickerBond: DatePickerBondInstance | undefined;

	export function resetCapturedDatePickerBonds() {
		capturedCalendarBond = undefined;
		capturedDatePickerBond = undefined;
	}
</script>

<script lang="ts">
	import { CalendarBond } from '$ixirjs/ui/components/calendar/bond.svelte';
	import type { CalendarBondProps } from '$ixirjs/ui/components/calendar/bond.svelte';
	import { DatePicker } from '$ixirjs/ui/components/date-picker';
	import { Root } from '$ixirjs/ui/components/root';
	import type { DatePickerRootProps } from '$ixirjs/ui/components/date-picker/types';

	let {
		type = 'single',
		onvaluechange,
		onrangechange,
		onpivotechange
	}: Pick<
		DatePickerRootProps,
		'type' | 'onvaluechange' | 'onrangechange' | 'onpivotechange'
	> = $props();

	const callbackProps = $derived({
		...(onvaluechange ? { onvaluechange } : {}),
		...(onrangechange ? { onrangechange } : {}),
		...(onpivotechange ? { onpivotechange } : {})
	});

	function calendarFactory(props: CalendarBondProps) {
		capturedCalendarBond = CalendarBond.create(props);
		return capturedCalendarBond;
	}

	function captureDatePicker(bond: DatePickerBondInstance) {
		capturedDatePickerBond = bond;
		return '';
	}
</script>

<Root>
	<DatePicker.Root {type} {...callbackProps}>
		{#snippet children({ datePicker })}
			{captureDatePicker(datePicker)}
			<DatePicker.Calendar factory={calendarFactory} />
		{/snippet}
	</DatePicker.Root>
</Root>
