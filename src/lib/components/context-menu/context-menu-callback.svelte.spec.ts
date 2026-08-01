import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import CallbackFixture from '$ixirjs/ui/test/components/context-menu/context-menu-callback.test.svelte';
import type { ContextMenuBond } from './bond.svelte';

describe('ContextMenu callbacks', () => {
	it('forwards onopenchange and round-trips bind:open without parent echoes', async () => {
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { onopenchange });
		const fixture = component as unknown as {
			getBond(): ContextMenuBond;
			getOpen(): boolean;
			setOpen(value: boolean): void;
		};
		const bond = fixture.getBond();

		expect(onopenchange).not.toHaveBeenCalled();

		bond.open();
		expect(fixture.getOpen()).toBe(true);
		expect(onopenchange).toHaveBeenCalledWith(true, { bond });

		fixture.setOpen(false);
		await tick();
		expect(bond.isOpen).toBe(false);
		expect(onopenchange).toHaveBeenCalledTimes(1);
	});

	it('preserves native onclick without opening from a left click', () => {
		const onclick = vi.fn();
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { onclick, onopenchange });
		const fixture = component as unknown as { getBond(): ContextMenuBond };
		const bond = fixture.getBond();
		const event = new MouseEvent('click', { bubbles: true });

		document
			.querySelector<HTMLElement>('[data-testid="context-menu-trigger"]')!
			.dispatchEvent(event);

		expect(onclick).toHaveBeenCalledWith(event);
		expect(onclick.mock.calls[0]).toHaveLength(1);
		expect(bond.isOpen).toBe(false);
		expect(onopenchange).not.toHaveBeenCalled();
	});
});
