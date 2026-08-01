import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverDialogRoot from './popover-dialog-root.svelte';
import type { PopoverDialogBond } from './bond.svelte';

describe('PopoverDialog callbacks', () => {
	it('reports committed open transitions without firing during initialization', () => {
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: PopoverDialogBond }) => {
			expect(bond?.isOpen).toBe(value);
		});
		const { component } = render(PopoverDialogRoot, { open: true, onopenchange });
		const bond = component.getBond();

		expect(onopenchange).not.toHaveBeenCalled();

		bond.close();
		expect(onopenchange).toHaveBeenCalledWith(false, { bond });

		bond.open();
		expect(onopenchange).toHaveBeenLastCalledWith(true, { bond });
	});
});
