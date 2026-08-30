import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CallbackFixture from '$ixirjs/ui/test/components/toast/toast-callback.test.svelte';
import type { ToastBond } from './bond.svelte';

describe('Toast callbacks', () => {
	it('reports committed transitions and leaves onclose as a native event handler', () => {
		const onclose = vi.fn();
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: ToastBond }) => {
			expect(bond?.isOpen).toBe(value);
		});
		const { component } = render(CallbackFixture, { open: true, onclose, onopenchange });
		const bond = (component as unknown as { getBond(): ToastBond }).getBond();
		const root = document.getElementById(bond.rootId) as HTMLElement;

		expect(onopenchange).not.toHaveBeenCalled();

		const closeEvent = new Event('close');
		root.dispatchEvent(closeEvent);
		expect(onclose).toHaveBeenCalledWith(closeEvent);
		expect(onopenchange).not.toHaveBeenCalled();

		bond.stageOpenChange({ reason: 'timeout' });
		bond.close();
		expect(onopenchange).toHaveBeenCalledWith(false, { bond, reason: 'timeout' });
	});

	it('auto-dismisses through the Bond-owned timeout capability', async () => {
		vi.useFakeTimers();
		try {
			const onopenchange = vi.fn();
			const { component } = render(CallbackFixture, { open: true, duration: 100, onopenchange });
			const bond = (component as unknown as { getBond(): ToastBond }).getBond();

			await vi.advanceTimersByTimeAsync(100);

			expect(bond.isOpen).toBe(false);
			expect(onopenchange).toHaveBeenCalledWith(false, { bond, reason: 'timeout' });
		} finally {
			vi.useRealTimers();
		}
	});

	it('includes keyboard close-button metadata after the transition commits', () => {
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { open: true, onopenchange });
		const bond = (component as unknown as { getBond(): ToastBond }).getBond();
		const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });

		document.querySelector<HTMLElement>('[data-testid="toast-close"]')!.dispatchEvent(event);

		expect(onopenchange).toHaveBeenCalledWith(false, {
			bond,
			event,
			reason: 'close-button'
		});
		expect(bond.isOpen).toBe(false);
	});
});
