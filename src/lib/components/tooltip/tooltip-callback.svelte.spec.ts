import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TooltipRoot from './tooltip-root.svelte';
import {
	TooltipBond,
	type TooltipBond as TooltipBondInstance,
	type TooltipBondProps
} from './bond.svelte';

describe('Tooltip callbacks', () => {
	it('forwards onopenchange through its Popover root wrapper', () => {
		let captured: TooltipBondInstance | undefined;
		const factory = (props: TooltipBondProps): TooltipBondInstance => {
			captured = TooltipBond.create(props);
			return captured;
		};
		const onopenchange = vi.fn();
		render(TooltipRoot, { factory, onopenchange });

		expect(captured).toBeDefined();
		expect(onopenchange).not.toHaveBeenCalled();

		captured!.open();
		expect(onopenchange).toHaveBeenCalledWith(true, { bond: captured });
	});
});
