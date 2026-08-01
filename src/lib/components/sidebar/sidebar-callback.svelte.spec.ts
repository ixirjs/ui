import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CallbackFixture from '$ixirjs/ui/test/components/sidebar/sidebar-callback.test.svelte';
import type { SidebarBond } from './bond.svelte';

describe('Sidebar callbacks', () => {
	it('reports committed attachment transitions once with the original event', () => {
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: SidebarBond }) => {
			expect(bond?.isOpen).toBe(value);
		});
		const { component } = render(CallbackFixture, { onopenchange });
		const bond = (component as unknown as { getBond(): SidebarBond }).getBond();

		expect(onopenchange).not.toHaveBeenCalled();

		const event = new MouseEvent('click', { bubbles: true });
		document
			.querySelector<HTMLElement>('[data-testid="sidebar-attachment-toggle"]')!
			.dispatchEvent(event);
		expect(onopenchange).toHaveBeenCalledWith(true, { bond, event, reason: 'trigger' });

		bond.open();
		expect(onopenchange).toHaveBeenCalledTimes(1);
	});
});
