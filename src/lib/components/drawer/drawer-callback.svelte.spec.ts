import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CallbackFixture from '$ixirjs/ui/test/components/drawer/drawer-callback.test.svelte';
import type { DrawerBond } from './bond.svelte';

describe('Drawer callbacks', () => {
	it('reports committed transitions and leaves onclose as a native event handler', () => {
		const onclose = vi.fn();
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: DrawerBond }) => {
			expect(bond?.isOpen).toBe(value);
		});
		const { component } = render(CallbackFixture, { open: true, onclose, onopenchange });
		const bond = (component as unknown as { getBond(): DrawerBond }).getBond();

		expect(onopenchange).not.toHaveBeenCalled();

		const closeEvent = new Event('close');
		(bond.elements.root as HTMLElement).dispatchEvent(closeEvent);
		expect(onclose).toHaveBeenCalledWith(closeEvent);
		expect(onopenchange).not.toHaveBeenCalled();

		const clickEvent = new MouseEvent('click', { bubbles: true });
		document
			.querySelector<HTMLElement>('[data-testid="drawer-attachment-close"]')!
			.dispatchEvent(clickEvent);
		expect(onopenchange).toHaveBeenCalledWith(false, {
			bond,
			event: clickEvent,
			reason: 'close-trigger'
		});
	});
});
