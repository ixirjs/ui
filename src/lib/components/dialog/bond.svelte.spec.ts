import { describe, expect, it } from 'vitest';
import { DialogBond, DialogBondState, type DialogBondProps } from './bond.svelte';
import { ignoreEscape, type FocusPolicySurface } from '$svelte-atoms/core/shared/overlay';

// Bond-seam specs: assert atom.spread, state methods, atom identity, strategy substitution. No DOM rendering.

function makeBond(initial: Partial<DialogBondProps> = {}) {
	const props = $state<DialogBondProps>({
		open: false,
		disabled: false,
		...initial
	});
	const state = new DialogBondState(props);
	const bond = new DialogBond(state);
	return { bond, props };
}

describe('DialogBondState (inherits OverlayState lifecycle methods)', () => {
	it('toggle() flips props.open', () => {
		const { bond, props } = makeBond();
		expect(props.open).toBe(false);
		bond.state.toggle();
		expect(props.open).toBe(true);
		bond.state.toggle();
		expect(props.open).toBe(false);
	});

	it('open()/close() set props.open absolutely', () => {
		const { bond, props } = makeBond({ open: true });
		bond.state.close();
		expect(props.open).toBe(false);
		bond.state.open();
		expect(props.open).toBe(true);
	});

	it('exposes reactive isOpen/isDisabled getters', () => {
		const { bond, props } = makeBond({ open: false, disabled: true });
		expect(bond.state.isOpen).toBe(false);
		expect(bond.state.isDisabled).toBe(true);
		props.open = true;
		expect(bond.state.isOpen).toBe(true);
	});
});

describe('DialogBond atom identity is stable (cache contract)', () => {
	it('root() returns the same atom across calls', () => {
		const { bond } = makeBond();
		expect(bond.root()).toBe(bond.root());
	});

	it('content() returns the same atom across calls', () => {
		const { bond } = makeBond();
		expect(bond.content()).toBe(bond.content());
	});
});

describe('Strategy substitution via capabilities (slot resolution)', () => {
	it('overriding the escape capability with IgnoreEscape: Escape does not close', () => {
		const props = $state<DialogBondProps>({ open: true, disabled: false });
		const bond = new DialogBond(new DialogBondState(props));
		// last-wins-per-slot replaces the bundle's CloseOnEscape (before the root atom
		// is built, so .role('surface') folds the new one).
		bond.capability(ignoreEscape);

		const onkeydown = bond.root().spread.onkeydown as (ev: KeyboardEvent) => void;
		onkeydown({ key: 'Escape', preventDefault: () => undefined } as KeyboardEvent);
		expect(props.open).toBe(true); // would be false with CloseOnEscape
	});

	it('default focus policy is trappedFocus (restoreFocus:previous, captureFocusOnOpen:true)', () => {
		const { bond } = makeBond();
		const focus = bond.capability<FocusPolicySurface>('focus')?.surface;
		expect(focus?.restoreFocus).toBe('previous');
		expect(focus?.captureFocusOnOpen).toBe(true);
	});
});
