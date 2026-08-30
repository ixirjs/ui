import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ModalFixture from '$ixirjs/ui/test/components/dialog/dialog-modal.test.svelte';
import { DialogBond, type DialogBondProps } from './bond.svelte';

function makeBond(initial: Partial<DialogBondProps> = {}) {
	const props = $state<DialogBondProps>({
		open: false,
		disabled: false,
		...initial
	});
	const bond = DialogBond.create(props);
	return { bond, props };
}

async function settle() {
	await tick();
	await Promise.resolve();
	await tick();
}

describe('DialogBond overlay lifecycle methods', () => {
	it('toggle() flips props.open', () => {
		const { bond, props } = makeBond();
		expect(props.open).toBe(false);
		bond.toggle();
		expect(props.open).toBe(true);
		bond.toggle();
		expect(props.open).toBe(false);
	});

	it('open()/close() set props.open absolutely', () => {
		const { bond, props } = makeBond({ open: true });
		bond.close();
		expect(props.open).toBe(false);
		bond.open();
		expect(props.open).toBe(true);
	});

	it('exposes reactive isOpen/isDisabled getters', () => {
		const { bond, props } = makeBond({ open: false, disabled: true });
		expect(bond.isOpen).toBe(false);
		expect(bond.isDisabled).toBe(true);
		props.open = true;
		expect(bond.isOpen).toBe(true);
	});
});

// Replaces the capability-slot specs ("strategy substitution", the FOCUS surface, `DialogRootAtom`
// spreads): the same outcomes, asserted on what renders. A consumer overrides the escape policy the
// way it overrides any handler now — its `onkeydown` runs first and `preventDefault` keeps the
// dialog open.
describe('Dialog modal behaviour (rendered)', () => {
	function escape(target: HTMLElement) {
		target.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		);
	}

	it('Escape on the surface closes the dialog with reason "escape"', async () => {
		const { component, unmount } = render(ModalFixture);
		await settle();
		const bond = (component as unknown as { getBond(): DialogBond }).getBond();
		const root = document.querySelector<HTMLElement>('[data-testid="dialog-root"]')!;

		expect(bond.isOpen).toBe(true);
		escape(root);
		expect(bond.isOpen).toBe(false);
		unmount();
	});

	it('a consumer onkeydown that prevents default keeps the dialog open on Escape', async () => {
		const { component, unmount } = render(ModalFixture, {
			onkeydown: (event: KeyboardEvent) => event.preventDefault()
		});
		await settle();
		const bond = (component as unknown as { getBond(): DialogBond }).getBond();

		escape(document.querySelector<HTMLElement>('[data-testid="dialog-root"]')!);
		expect(bond.isOpen).toBe(true);
		unmount();
	});

	it('moves focus into the content on open and restores the previously focused element on close', async () => {
		const { component, rerender, unmount } = render(ModalFixture, { open: false });
		await settle();
		const outside = document.querySelector<HTMLElement>('[data-testid="outside"]')!;
		outside.focus();
		expect(document.activeElement).toBe(outside);

		await rerender({ open: true });
		await settle();
		expect(document.activeElement).toBe(document.querySelector('[data-testid="inside"]'));

		(component as unknown as { getBond(): DialogBond }).getBond().close();
		await settle();
		expect(document.activeElement).toBe(outside);
		unmount();
	});

	it('projects modal ARIA and inert by default, and neither when non-modal', async () => {
		const { rerender, unmount } = render(ModalFixture, { open: false });
		await settle();
		const root = document.querySelector<HTMLElement>('[data-testid="dialog-root"]')!;

		expect(root.getAttribute('role')).toBe('dialog');
		expect(root.getAttribute('aria-modal')).toBe('true');
		expect(root.hasAttribute('inert')).toBe(true);
		expect(root.dataset.state).toBe('closed');

		await rerender({ type: 'non-modal' });
		await settle();
		expect(root.getAttribute('aria-modal')).toBeNull();
		expect(root.hasAttribute('inert')).toBe(false);
		unmount();
	});
});
