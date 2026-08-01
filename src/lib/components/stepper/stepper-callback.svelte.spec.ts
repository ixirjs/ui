import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { StateChangeContext } from '$ixirjs/ui/types';
import type { StepperBond } from './bond.svelte';
import StepperRoot from './stepper-root.svelte';

describe('Stepper callbacks', () => {
	it('reports real step transitions after the Bond commits and not during initialization', () => {
		const committedStates: boolean[] = [];
		const onstepchange = vi.fn((value: number, { bond }: StateChangeContext<StepperBond>) => {
			committedStates.push(bond?.activeStep === value);
		});
		const { component } = render(StepperRoot, { step: 1, onstepchange });
		const bond = component.getBond();

		expect(onstepchange).not.toHaveBeenCalled();

		bond.navigation.reset();
		expect(onstepchange).toHaveBeenCalledWith(0, { bond });
		expect(committedStates).toEqual([true]);

		bond.navigation.reset();
		expect(onstepchange).toHaveBeenCalledTimes(1);
	});
});
