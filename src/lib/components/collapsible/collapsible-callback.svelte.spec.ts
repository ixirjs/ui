import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { StateChangeContext } from '$ixirjs/ui/types';
import type { CollapsibleBond } from './bond.svelte';
import CollapsibleRoot from './collapsible-root.svelte';

describe('Collapsible callbacks', () => {
	it('reports real open transitions after the Bond commits and not during initialization', () => {
		const committedStates: boolean[] = [];
		const onopenchange = vi.fn((value: boolean, { bond }: StateChangeContext<CollapsibleBond>) => {
			committedStates.push(bond?.isOpen === value);
		});
		const { component } = render(CollapsibleRoot, { open: true, onopenchange });
		const bond = component.getBond();

		expect(onopenchange).not.toHaveBeenCalled();

		bond.close();
		expect(onopenchange).toHaveBeenCalledWith(false, { bond });
		expect(committedStates).toEqual([true]);

		bond.close();
		expect(onopenchange).toHaveBeenCalledTimes(1);

		bond.open();
		expect(onopenchange).toHaveBeenLastCalledWith(true, { bond });
		expect(committedStates).toEqual([true, true]);
	});
});
