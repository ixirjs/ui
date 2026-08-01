import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CallbackFixture from '$ixirjs/ui/test/components/dialog/dialog-callback.test.svelte';
import type { DialogBond } from './bond.svelte';

describe('Dialog callbacks', () => {
	it('reports committed open transitions, dismissal details, and native clicks separately', () => {
		const onclick = vi.fn();
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: DialogBond }) => {
			expect(bond?.isOpen).toBe(value);
		});
		const { component } = render(CallbackFixture, { open: true, onclick, onopenchange });
		const bond = (component as unknown as { getBond(): DialogBond }).getBond();

		expect(onopenchange).not.toHaveBeenCalled();

		const event = new MouseEvent('click', { bubbles: true });
		(bond.elements.root as HTMLElement).dispatchEvent(event);

		expect(onclick).toHaveBeenCalledWith(event);
		expect(onclick.mock.calls[0]).toHaveLength(1);
		expect(onopenchange).toHaveBeenCalledWith(false, {
			bond,
			event,
			reason: 'backdrop-press'
		});

		bond.close();
		expect(onopenchange).toHaveBeenCalledTimes(1);
	});

	it('includes the original event when closeDialog dismisses it', () => {
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { open: true, onopenchange });
		const bond = (component as unknown as { getBond(): DialogBond }).getBond();
		const event = new MouseEvent('click', { bubbles: true });

		document
			.querySelector<HTMLElement>('[data-testid="dialog-attachment-close"]')!
			.dispatchEvent(event);

		expect(onopenchange).toHaveBeenCalledWith(false, {
			bond,
			event,
			reason: 'close-trigger'
		});
	});

	it('includes keyboard close-button metadata after the transition commits', () => {
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { open: true, onopenchange });
		const bond = (component as unknown as { getBond(): DialogBond }).getBond();
		const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });

		document.querySelector<HTMLElement>('[data-testid="dialog-close"]')!.dispatchEvent(event);

		expect(onopenchange).toHaveBeenCalledWith(false, {
			bond,
			event,
			reason: 'close-button'
		});
		expect(bond.isOpen).toBe(false);
	});
});
