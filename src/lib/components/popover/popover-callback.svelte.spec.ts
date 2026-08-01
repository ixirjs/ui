import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverRoot from './popover-root.svelte';
import type { PopoverBond } from './bond.svelte';

describe('Popover callbacks', () => {
	it('reports committed transitions once and suppresses initialization and parent echoes', async () => {
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: PopoverBond }) => {
			expect(bond?.isOpen).toBe(value);
		});
		const { component, rerender } = render(PopoverRoot, { onopenchange });
		const bond = (component as unknown as { getBond(): PopoverBond }).getBond();

		expect(onopenchange).not.toHaveBeenCalled();

		await rerender({ open: true, onopenchange });
		expect(bond.isOpen).toBe(true);
		expect(onopenchange).not.toHaveBeenCalled();

		bond.close();
		expect(onopenchange).toHaveBeenCalledWith(false, { bond });

		bond.close();
		expect(onopenchange).toHaveBeenCalledTimes(1);
	});
});
