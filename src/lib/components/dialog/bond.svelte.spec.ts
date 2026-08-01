import { describe, expect, it } from 'vitest';
import { Atom } from '$svelte-atoms/core/shared/bond';
import {
	DialogBodyAtom,
	DialogBond,
	DialogCloseAtom,
	DialogContentAtom,
	DialogDescriptionAtom,
	DialogFooterAtom,
	DialogHeaderAtom,
	DialogRootAtom,
	DialogTitleAtom,
	type DialogBondProps
} from './bond.svelte';
import { ignoreEscape, FOCUS } from '$svelte-atoms/core/components/portal/host';

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

describe('DialogBond generated atom methods', () => {
	it('return Dialog Atoms', () => {
		const { bond } = makeBond();
		const nodes = [
			bond.root(),
			bond.content(),
			bond.header(),
			bond.title(),
			bond.description(),
			bond.body(),
			bond.footer(),
			bond.closeButton()
		];

		expect(nodes[0]).toBeInstanceOf(DialogRootAtom);
		expect(nodes[1]).toBeInstanceOf(DialogContentAtom);
		expect(nodes[2]).toBeInstanceOf(DialogHeaderAtom);
		expect(nodes[3]).toBeInstanceOf(DialogTitleAtom);
		expect(nodes[4]).toBeInstanceOf(DialogDescriptionAtom);
		expect(nodes[5]).toBeInstanceOf(DialogBodyAtom);
		expect(nodes[6]).toBeInstanceOf(DialogFooterAtom);
		expect(nodes[7]).toBeInstanceOf(DialogCloseAtom);

		for (const node of nodes) {
			expect(node).toBeInstanceOf(Atom);
		}
	});
});

describe('Strategy substitution via capabilities (slot resolution)', () => {
	it('overriding the escape capability with IgnoreEscape: Escape does not close', () => {
		const props = $state<DialogBondProps>({ open: true, disabled: false });
		const bond = DialogBond.create(props);
		// last-wins-per-slot replaces the bundle's CloseOnEscape (before the root atom is built)
		bond.capability(ignoreEscape);

		const onkeydown = bond.root().spread.onkeydown as (ev: KeyboardEvent) => void;
		onkeydown({ key: 'Escape', preventDefault: () => undefined } as KeyboardEvent);
		expect(props.open).toBe(true); // would be false with CloseOnEscape
	});

	it('default focus policy is trappedFocus (restoreFocus:previous, captureFocusOnOpen:true)', () => {
		const { bond } = makeBond();
		const focus = bond.capability(FOCUS)?.surface;
		expect(focus?.restoreFocus).toBe('previous');
		expect(focus?.captureFocusOnOpen).toBe(true);
	});
});
