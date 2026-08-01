import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarRoot from './calendar-root.svelte';
import type { CalendarRange } from './types';
import type { CalendarBond } from './bond.svelte';

describe('Calendar callbacks', () => {
	it('reports committed semantic transitions without firing during initialization', () => {
		const onvaluechange = vi.fn((value: Date | undefined, { bond }: { bond?: CalendarBond }) => {
			expect(bond?.props.value).toBe(value);
		});
		const onrangechange = vi.fn((value: CalendarRange, { bond }: { bond?: CalendarBond }) => {
			expect(bond?.props.range).toBe(value);
		});
		const onpivotechange = vi.fn((value: Date, { bond }: { bond?: CalendarBond }) => {
			expect(bond?.props.pivote).toBe(value);
		});
		const initialPivote = new Date(2026, 0, 1);
		const { component } = render(CalendarRoot, {
			range: [undefined, undefined],
			pivote: initialPivote,
			onvaluechange,
			onrangechange,
			onpivotechange
		});
		const bond = (component as unknown as { getBond(): CalendarBond }).getBond();

		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onrangechange).not.toHaveBeenCalled();
		expect(onpivotechange).not.toHaveBeenCalled();

		const selected = new Date(2026, 0, 12);
		bond.selectStart(selected);

		expect(onvaluechange).toHaveBeenCalledWith(selected, { bond });
		expect(onrangechange).not.toHaveBeenCalled();

		bond.nextMonth();
		const nextPivote = bond.props.pivote;
		expect(nextPivote).toEqual(new Date(2026, 1, 1));
		expect(onpivotechange).toHaveBeenCalledWith(nextPivote, { bond });

		bond.selectStart(selected);
		expect(onvaluechange).toHaveBeenCalledTimes(1);
		expect(onrangechange).not.toHaveBeenCalled();
	});

	it('reports range transitions through the range callback in range mode', () => {
		const onvaluechange = vi.fn();
		const onrangechange = vi.fn();
		const { component } = render(CalendarRoot, {
			type: 'range',
			range: [undefined, undefined],
			onvaluechange,
			onrangechange
		});
		const bond = (component as unknown as { getBond(): CalendarBond }).getBond();
		const start = new Date(2026, 0, 12);
		const end = new Date(2026, 0, 18);

		bond.selectStart(start);
		bond.selectEnd(end);

		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onrangechange).toHaveBeenNthCalledWith(1, [start, undefined], { bond });
		expect(onrangechange).toHaveBeenNthCalledWith(2, [start, end], { bond });
	});

	it('does not report parent-controlled echoes as Bond transitions', async () => {
		const onvaluechange = vi.fn();
		const onrangechange = vi.fn();
		const onpivotechange = vi.fn();
		const legacyValue = new Date(2025, 11, 20);
		const { component, rerender } = render(CalendarRoot, {
			range: [legacyValue, undefined],
			pivote: new Date(2026, 0, 1),
			onvaluechange,
			onrangechange,
			onpivotechange
		});
		const bond = (component as unknown as { getBond(): CalendarBond }).getBond();
		expect(bond.props.value).toBe(legacyValue);
		const parentValue = new Date(2026, 0, 20);
		const parentPivote = new Date(2026, 2, 1);

		await rerender({ value: parentValue, pivote: parentPivote });

		expect(bond.props.value).toBe(parentValue);
		expect(bond.props.range).toEqual([parentValue, undefined]);
		expect(bond.props.pivote).toBe(parentPivote);

		await rerender({ value: undefined });
		expect(bond.props.value).toBeUndefined();
		expect(bond.props.range).toEqual([undefined, undefined]);
		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onrangechange).not.toHaveBeenCalled();
		expect(onpivotechange).not.toHaveBeenCalled();
	});

	it('passes native change callbacks only their DOM event', () => {
		const onchange = vi.fn();
		const { container } = render(CalendarRoot, { onchange });
		const event = new Event('change', { bubbles: true });

		container.querySelector('[data-atom="calendar-root"]')?.dispatchEvent(event);

		expect(onchange.mock.calls[0]).toEqual([event]);
	});
});
