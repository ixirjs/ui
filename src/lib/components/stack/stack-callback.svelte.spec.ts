import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { StateChangeContext } from '$ixirjs/ui/types';
import type { StackBond } from './bond.svelte';
import StackRoot from './stack-root.svelte';

describe('Stack callbacks', () => {
	it('reports real value transitions after the Bond commits and not during initialization', () => {
		const committedStates: boolean[] = [];
		const onvaluechange = vi.fn(
			(value: string | undefined, { bond }: StateChangeContext<StackBond>) => {
				committedStates.push(bond?.props.value === value);
			}
		);
		const { component } = render(StackRoot, { value: 'two', onvaluechange });
		const bond = component.getBond();

		expect(onvaluechange).not.toHaveBeenCalled();

		bond.registerItem('one');
		bond.registerItem('two');
		bond.bringToFront('one');
		expect(onvaluechange).toHaveBeenCalledWith('one', { bond });
		expect(committedStates).toEqual([true]);

		bond.bringToFront('one');
		expect(onvaluechange).toHaveBeenCalledTimes(1);
	});
});
