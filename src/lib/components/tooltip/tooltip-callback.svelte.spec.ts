import type { TooltipBond } from './bond.svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TooltipRoot from './tooltip-root.svelte';

describe('Tooltip callbacks', () => {
	it('forwards onopenchange through its Popover root wrapper', () => {
		const onopenchange = vi.fn();
		const { component } = render(TooltipRoot, { onopenchange });
		const captured = (component as unknown as { getBond(): TooltipBond }).getBond();

		expect(captured).toBeDefined();
		expect(onopenchange).not.toHaveBeenCalled();

		captured!.open();
		expect(onopenchange).toHaveBeenCalledWith(true, { bond: captured });
	});
});
