import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DropdownMenuRoot from './dropdown-menu-root.svelte';
import {
	DropdownMenuBond,
	type DropdownMenuBond as DropdownMenuBondInstance,
	type DropdownMenuBondProps
} from './bond.svelte';

describe('DropdownMenu callbacks', () => {
	it('forwards onopenchange through its Popover root wrapper', () => {
		let captured: DropdownMenuBondInstance | undefined;
		const factory = (props: DropdownMenuBondProps): DropdownMenuBondInstance => {
			captured = DropdownMenuBond.create(props);
			return captured;
		};
		const onopenchange = vi.fn();
		render(DropdownMenuRoot, { factory, onopenchange });

		expect(captured).toBeDefined();
		expect(onopenchange).not.toHaveBeenCalled();

		captured!.open();
		expect(onopenchange).toHaveBeenCalledWith(true, { bond: captured });
	});
});
