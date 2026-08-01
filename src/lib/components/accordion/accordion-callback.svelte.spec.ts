import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { StateChangeContext } from '$ixirjs/ui/types';
import AccordionRoot from './accordion-root.svelte';
import type { AccordionBond } from './bond.svelte';

describe('Accordion callbacks', () => {
	it('reports only onvaluechange in single mode after the Bond commits', () => {
		const committedStates: boolean[] = [];
		const onvaluechange = vi.fn(
			(value: string | undefined, { bond }: StateChangeContext<AccordionBond>) => {
				committedStates.push(bond?.values[0] === value);
			}
		);
		const onvalueschange = vi.fn();
		const { component } = render(AccordionRoot, {
			value: 'one',
			onvaluechange,
			onvalueschange
		});
		const bond = component.getBond();

		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onvalueschange).not.toHaveBeenCalled();

		bond.open(['two']);
		expect(onvaluechange).toHaveBeenCalledWith('two', { bond });
		expect(onvalueschange).not.toHaveBeenCalled();
		expect(committedStates).toEqual([true]);

		bond.open(['two']);
		expect(onvaluechange).toHaveBeenCalledTimes(1);
	});

	it('reports only onvalueschange in multiple mode after the Bond commits', () => {
		const committedStates: boolean[] = [];
		const onvaluechange = vi.fn();
		const onvalueschange = vi.fn(
			(values: string[], { bond }: StateChangeContext<AccordionBond>) => {
				committedStates.push(
					values.length === bond?.values.length &&
						values.every((value, index) => value === bond.values[index])
				);
			}
		);
		const { component } = render(AccordionRoot, {
			multiple: true,
			values: ['one'],
			onvaluechange,
			onvalueschange
		});
		const bond = component.getBond();

		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onvalueschange).not.toHaveBeenCalled();

		bond.open(['two']);
		expect(onvalueschange).toHaveBeenCalledWith(['one', 'two'], { bond });
		expect(onvaluechange).not.toHaveBeenCalled();
		expect(committedStates).toEqual([true]);

		bond.open(['two']);
		expect(onvalueschange).toHaveBeenCalledTimes(1);
	});
});
