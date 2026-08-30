import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CallbackFixture from '$ixirjs/ui/test/components/toast/toast-callback.test.svelte';
import type { ToastBond } from './bond.svelte';

// The close policy as the DOM sees it — what `disclosure-capability.svelte.spec.ts` asserted on
// the old runtime through `ToastCloseAtom(bond).role('close').spread.onclick`.
describe('Toast.Close', () => {
	const setup = (props: Record<string, unknown>) => {
		const { component } = render(CallbackFixture, { open: true, ...props });
		const bond = (component as unknown as { getBond(): ToastBond }).getBond();
		const close = document.querySelector<HTMLElement>('[data-testid="toast-close"]')!;
		return { bond, close };
	};

	it('closes a disabled toast: `disabled` guards opening, not dismissal', () => {
		const { bond, close } = setup({ disabled: true });

		close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		expect(bond.isOpen).toBe(false);
	});

	it('disables the control and ignores activation when the toast is not dismissible', () => {
		const { bond, close } = setup({ dismissible: false });

		expect(close).toHaveAttribute('disabled');
		expect(close).toHaveAttribute('aria-disabled', 'true');
		expect(close).toHaveAttribute('tabindex', '-1');

		close.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		expect(bond.isOpen).toBe(true);
	});
});
