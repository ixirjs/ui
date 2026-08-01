import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DatePickerRoot from './date-picker-root.svelte';
import type { CalendarRange } from '$ixirjs/ui/components/calendar/types';
import type { DatePickerBond } from './bond.svelte';
import ForwardingProbe, {
	capturedCalendarBond,
	capturedDatePickerBond,
	resetCapturedDatePickerBonds
} from '$ixirjs/ui/test/components/date-picker/date-picker-callback.test.svelte';

describe('DatePicker callbacks', () => {
	beforeEach(resetCapturedDatePickerBonds);

	it('forwards committed open, value, range, and pivote transitions', () => {
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: DatePickerBond }) => {
			expect(bond?.props.open).toBe(value);
		});
		const onvaluechange = vi.fn((value: Date | undefined, { bond }: { bond?: DatePickerBond }) => {
			expect(bond?.props.value).toBe(value);
		});
		const onrangechange = vi.fn((value: CalendarRange, { bond }: { bond?: DatePickerBond }) => {
			expect(bond?.props.range).toBe(value);
		});
		const onpivotechange = vi.fn((value: Date, { bond }: { bond?: DatePickerBond }) => {
			expect(bond?.props.pivote).toBe(value);
		});
		const initialPivote = new Date(2026, 0, 1);
		const { component } = render(DatePickerRoot, {
			range: [undefined, undefined],
			pivote: initialPivote,
			onopenchange,
			onvaluechange,
			onrangechange,
			onpivotechange
		});
		const bond = (component as unknown as { getBond(): DatePickerBond }).getBond();

		expect(onopenchange).not.toHaveBeenCalled();
		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onrangechange).not.toHaveBeenCalled();
		expect(onpivotechange).not.toHaveBeenCalled();

		bond.open();
		const selected = new Date(2026, 0, 12);
		bond.props.value = selected;
		const nextPivote = new Date(2026, 1, 1);
		bond.props.pivote = nextPivote;

		expect(onopenchange).toHaveBeenCalledWith(true, { bond });
		expect(onvaluechange).toHaveBeenCalledWith(selected, { bond });
		expect(onrangechange).not.toHaveBeenCalled();
		expect(onpivotechange).toHaveBeenCalledWith(nextPivote, { bond });

		bond.props.value = selected;
		bond.props.range = [selected, undefined];
		bond.props.pivote = nextPivote;
		expect(onvaluechange).toHaveBeenCalledTimes(1);
		expect(onrangechange).not.toHaveBeenCalled();
		expect(onpivotechange).toHaveBeenCalledTimes(1);
	});

	it('reports start/end commits through onrangechange in range mode', () => {
		const onvaluechange = vi.fn();
		const onrangechange = vi.fn();
		const { component } = render(DatePickerRoot, {
			type: 'range',
			onvaluechange,
			onrangechange
		});
		const bond = (component as unknown as { getBond(): DatePickerBond }).getBond();
		const start = new Date(2026, 0, 12);
		const end = new Date(2026, 0, 18);

		bond.selectStart(start);
		bond.selectEnd(end);

		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onrangechange).toHaveBeenNthCalledWith(1, [start, undefined], { bond });
		expect(onrangechange).toHaveBeenNthCalledWith(2, [start, end], { bond });
	});

	it('forwards nested Calendar callbacks through the DatePicker Bond once', () => {
		const onvaluechange = vi.fn();
		const onrangechange = vi.fn();
		const onpivotechange = vi.fn();
		render(ForwardingProbe, { onvaluechange, onrangechange, onpivotechange });
		const calendar = capturedCalendarBond;
		const datePicker = capturedDatePickerBond;
		expect(calendar).toBeDefined();
		expect(datePicker).toBeDefined();

		const selected = new Date(2026, 0, 12);
		calendar?.selectStart(selected);
		calendar?.nextMonth();

		expect(onvaluechange).toHaveBeenCalledOnce();
		expect(onvaluechange).toHaveBeenCalledWith(selected, { bond: datePicker });
		expect(onrangechange).not.toHaveBeenCalled();
		expect(onpivotechange).toHaveBeenCalledOnce();
		expect(onpivotechange).toHaveBeenCalledWith(datePicker?.props.pivote, { bond: datePicker });
	});

	it('forwards nested Calendar ranges without an intermediate value callback', () => {
		const onvaluechange = vi.fn();
		const onrangechange = vi.fn();
		render(ForwardingProbe, { type: 'range', onvaluechange, onrangechange });
		const calendar = capturedCalendarBond;
		const datePicker = capturedDatePickerBond;
		const start = new Date(2026, 0, 12);
		const end = new Date(2026, 0, 18);

		calendar?.selectStart(start);
		calendar?.selectEnd(end);

		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onrangechange).toHaveBeenNthCalledWith(1, [start, undefined], { bond: datePicker });
		expect(onrangechange).toHaveBeenNthCalledWith(2, [start, end], { bond: datePicker });
	});

	it('accepts controlled range-bound updates without callback echoes', async () => {
		const onrangechange = vi.fn();
		const tupleStart = new Date(2025, 11, 10);
		const tupleEnd = new Date(2025, 11, 20);
		const { component, rerender } = render(DatePickerRoot, {
			type: 'range',
			range: [tupleStart, tupleEnd],
			onrangechange
		});
		const bond = (component as unknown as { getBond(): DatePickerBond }).getBond();
		const start = new Date(2026, 0, 12);
		const end = new Date(2026, 0, 18);

		expect(bond.props.range).toEqual([tupleStart, tupleEnd]);
		await rerender({ start, end });
		expect(bond.props.range).toEqual([start, end]);
		expect(onrangechange).not.toHaveBeenCalled();

		await rerender({ start: undefined });
		expect(bond.props.range).toEqual([undefined, end]);
		expect(onrangechange).not.toHaveBeenCalled();
	});

	it('does not report parent-controlled prop echoes', async () => {
		const onopenchange = vi.fn();
		const onvaluechange = vi.fn();
		const onrangechange = vi.fn();
		const onpivotechange = vi.fn();
		const { component, rerender } = render(DatePickerRoot, {
			range: [undefined, undefined],
			onopenchange,
			onvaluechange,
			onrangechange,
			onpivotechange
		});
		const bond = (component as unknown as { getBond(): DatePickerBond }).getBond();
		const parentValue = new Date(2026, 0, 20);
		const parentPivote = new Date(2026, 2, 1);

		await rerender({ open: true, value: parentValue, pivote: parentPivote });

		expect(bond.props.open).toBe(true);
		expect(bond.props.value).toBe(parentValue);
		expect(bond.props.range).toEqual([parentValue, undefined]);
		expect(bond.props.pivote).toBe(parentPivote);
		expect(onopenchange).not.toHaveBeenCalled();
		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onrangechange).not.toHaveBeenCalled();
		expect(onpivotechange).not.toHaveBeenCalled();
	});
});
