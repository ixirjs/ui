import type { DropdownMenuBond } from './bond.svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DropdownMenuRoot from './dropdown-menu-root.svelte';

describe('DropdownMenu callbacks', () => {
	it('forwards onopenchange through its Popover root wrapper', () => {
		const onopenchange = vi.fn();
		const { component } = render(DropdownMenuRoot, { onopenchange });
		const captured = (component as unknown as { getBond(): DropdownMenuBond }).getBond();

		expect(captured).toBeDefined();
		expect(onopenchange).not.toHaveBeenCalled();

		captured!.open();
		expect(onopenchange).toHaveBeenCalledWith(true, { bond: captured });
	});
});
