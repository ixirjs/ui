import { describe, expect, it } from 'vitest';
import { DialogBond, DialogRootAtom, type DialogBondProps } from './bond.svelte';
import { ignoreEscape, FOCUS } from '$ixirjs/ui/components/overlay';

// Bond-seam specs: assert atom.spread, state methods, atom identity, strategy substitution. No DOM rendering.

function makeBond(initial: Partial<DialogBondProps> = {}) {
	const props = $state<DialogBondProps>({
		open: false,
		disabled: false,
		...initial
	});
	const bond = DialogBond.create(props);
	return { bond, props };
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

describe('Strategy substitution via capabilities (slot resolution)', () => {
	it('overriding the escape capability with IgnoreEscape: Escape does not close', () => {
		const props = $state<DialogBondProps>({ open: true, disabled: false });
		const bond = DialogBond.create(props);
		// last-wins-per-slot replaces the bundle's CloseOnEscape (before the root atom is built)
		bond.capability(ignoreEscape);

		const onkeydown = new DialogRootAtom(bond).spread.onkeydown as (ev: KeyboardEvent) => void;
		onkeydown({ key: 'Escape', preventDefault: () => undefined } as KeyboardEvent);
		expect(props.open).toBe(true); // would be false with CloseOnEscape
	});

	it('default focus policy is trappedFocus (restoreFocus:previous, captureFocusOnOpen:true)', () => {
		const { bond } = makeBond();
		const focus = bond.capability(FOCUS)?.surface;
		expect(focus?.restoreFocus).toBe('previous');
		expect(focus?.captureFocusOnOpen).toBe(true);
	});

	it('uses modal behavior by default and suppresses modal ARIA/inert when modal is false', () => {
		const { bond: modal } = makeBond({ open: false });
		const { bond: nonModal } = makeBond({ open: false, modal: false });

		expect(modal.modal).toBe(true);
		expect(new DialogRootAtom(modal).spread['aria-modal']).toBe(true);
		expect(new DialogRootAtom(modal).spread.inert).toBe(true);
		expect(nonModal.modal).toBe(false);
		expect(new DialogRootAtom(nonModal).spread['aria-modal']).toBeUndefined();
		expect(new DialogRootAtom(nonModal).spread.inert).toBeUndefined();
	});
});
