import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CallbackFixture from '$ixirjs/ui/test/components/dialog/dialog-callback.test.svelte';
import type { DialogBond } from './bond.svelte';

// Characterization of the close-button handler contract, written before `<Dialog.Close />` moved
// from `{...part.props}` onto the direct `{part}` seam. The packet shape let the component override
// the merged handler and re-invoke it by hand; the seam composes instead. These assertions hold for
// both, so they are what proves the migration did not change behavior.
describe('Dialog.Close — handler composition', () => {
	it('runs the atom close exactly once per click', () => {
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { open: true, onopenchange });
		const bond = (component as unknown as { getBond(): DialogBond }).getBond();

		document
			.querySelector<HTMLElement>('[data-testid="dialog-close"]')!
			.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		// A double-invoked atom handler still lands on `open: false`, so state alone cannot catch it.
		// The transition callback count can.
		expect(onopenchange).toHaveBeenCalledTimes(1);
		expect(bond.isOpen).toBe(false);
	});

	it('reports the close-button reason and the originating event', () => {
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { open: true, onopenchange });
		const bond = (component as unknown as { getBond(): DialogBond }).getBond();
		const event = new MouseEvent('click', { bubbles: true });

		document.querySelector<HTMLElement>('[data-testid="dialog-close"]')!.dispatchEvent(event);

		expect(onopenchange).toHaveBeenCalledWith(false, { bond, event, reason: 'close-button' });
	});

	it('lets a consumer onclick preventDefault to keep the dialog open', () => {
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { open: true, onopenchange });
		const bond = (component as unknown as { getBond(): DialogBond }).getBond();

		// The gate is the whole reason these components hand-rolled the handler: the consumer's
		// handler runs first, and preventing default must stop both the staging and the atom close.
		const close = document.querySelector<HTMLElement>('[data-testid="dialog-close"]')!;
		close.addEventListener('click', (event) => event.preventDefault());
		close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(onopenchange).not.toHaveBeenCalled();
		expect(bond.isOpen).toBe(true);
	});
});
