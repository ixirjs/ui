import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { Bond, Atom, BondState, type BondStateProps } from '../../bond';
import {
	createDisclosure,
	disclosureCapability,
	disclosureClose,
	disclosureToggle,
	disclosureTrigger,
	DISCLOSURE,
	DISCLOSURE_CLOSE,
	DISCLOSURE_TOGGLE,
	DISCLOSURE_TRIGGER,
	type DisclosureBacking
} from './disclosure.svelte';

// Reactive boolean store standing in for a bond's bindable `props.open`.
function makeBacking(initial = false) {
	let open = $state(initial);
	const backing: DisclosureBacking = {
		get: () => open,
		set: (v) => (open = v)
	};
	return { backing, read: () => open };
}

type ActivationProps = BondStateProps & { disabled: boolean };

class ActivationState extends BondState<ActivationProps> {
	open = $state(false);
	disclosure = createDisclosure({
		get: () => this.open,
		set: (v) => (this.open = v)
	});

	constructor(props: ActivationProps = { disabled: false }) {
		super(props);
		this.capability(disclosureCapability(this.disclosure));
	}
}

class ActivationBond extends Bond<ActivationProps> {
	constructor(state = new ActivationState()) {
		super(state.props, 'activation');
		for (const capability of state.capabilities) this.capability(capability);
	}
}

class ActivationAtom extends Atom<ActivationBond> {
	constructor(bond: ActivationBond, key = 'button') {
		super(bond, key);
	}
}

function activationFixture(role: string, capability: ReturnType<typeof disclosureTrigger>) {
	const state = new ActivationState();
	state.capability(capability);
	const bond = new ActivationBond(state);
	const atom = new ActivationAtom(bond).role(role);
	return { atom, bond, state };
}

function clickEvent(overrides: Partial<MouseEvent> = {}) {
	return {
		button: 0,
		defaultPrevented: false,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
		...overrides
	} as unknown as MouseEvent;
}

function keyEvent(key: string, overrides: Partial<KeyboardEvent> = {}) {
	return {
		key,
		defaultPrevented: false,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
		...overrides
	} as unknown as KeyboardEvent;
}

describe('Disclosure — degenerate SelectionModel over {self}', () => {
	it('wraps the disclosure surface as a Layer 1 model capability', () => {
		const disclosure = createDisclosure(makeBacking(false).backing);
		const cap = disclosureCapability(disclosure);
		expect(cap.slot).toBe(DISCLOSURE);
		expect(cap.surface).toBe(disclosure);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'model'
		});
	});

	it('starts from the backing value', () => {
		expect(createDisclosure(makeBacking(false).backing).isOpen).toBe(false);
		expect(createDisclosure(makeBacking(true).backing).isOpen).toBe(true);
	});

	it('open / close set the boolean backing', () => {
		const { backing, read } = makeBacking(false);
		const d = createDisclosure(backing);
		d.open();
		expect(read()).toBe(true);
		expect(d.isOpen).toBe(true);
		d.close();
		expect(read()).toBe(false);
		expect(d.isOpen).toBe(false);
	});

	it('toggle flips both directions', () => {
		const { backing } = makeBacking(false);
		const d = createDisclosure(backing);
		d.toggle();
		expect(d.isOpen).toBe(true);
		d.toggle();
		expect(d.isOpen).toBe(false);
	});

	it('open is idempotent, close is idempotent', () => {
		const { backing, read } = makeBacking(false);
		const d = createDisclosure(backing);
		d.open();
		d.open();
		expect(read()).toBe(true);
		d.close();
		d.close();
		expect(read()).toBe(false);
	});

	it('isOpen is reactive', () => {
		const { backing } = makeBacking(false);
		const d = createDisclosure(backing);
		let count = 0;
		const dispose = $effect.root(() => {
			$effect(() => {
				void d.isOpen;
				count++;
			});
		});
		flushSync();
		const initial = count;
		d.open();
		flushSync();
		expect(count).toBeGreaterThan(initial);
		dispose();
	});
});

describe('Disclosure activation policies', () => {
	it('disclosureTrigger toggles on guarded click and Enter/Space', () => {
		const { atom, state } = activationFixture('trigger', disclosureTrigger());

		(atom.spread.onclick as (ev: MouseEvent) => void)(clickEvent());
		expect(state.open).toBe(true);

		const enter = keyEvent('Enter');
		(atom.spread.onkeydown as (ev: KeyboardEvent) => void)(enter);
		expect(enter.preventDefault).toHaveBeenCalled();
		expect(state.open).toBe(false);

		const space = keyEvent(' ');
		(atom.spread.onkeydown as (ev: KeyboardEvent) => void)(space);
		expect(space.preventDefault).toHaveBeenCalled();
		expect(state.open).toBe(true);
	});

	it('disclosureTrigger ignores disabled, defaultPrevented, and right-click events', () => {
		const { atom, state } = activationFixture('trigger', disclosureTrigger());

		state.props.disabled = true;
		(atom.spread.onclick as (ev: MouseEvent) => void)(clickEvent());
		expect(state.open).toBe(false);

		state.props.disabled = false;
		(atom.spread.onclick as (ev: MouseEvent) => void)(clickEvent({ defaultPrevented: true }));
		expect(state.open).toBe(false);

		(atom.spread.onclick as (ev: MouseEvent) => void)(clickEvent({ button: 2 }));
		expect(state.open).toBe(false);
	});

	it('disclosureClose and disclosureToggle project onto their own roles', () => {
		const close = disclosureClose({ stopPropagation: true, disabled: false });
		const toggle = disclosureToggle();

		expect(close.slot).toBe(DISCLOSURE_CLOSE);
		expect(toggle.slot).toBe(DISCLOSURE_TOGGLE);
		expect(disclosureTrigger().slot).toBe(DISCLOSURE_TRIGGER);
		expect(close.requires).toEqual([DISCLOSURE]);
		expect(close.meta).toMatchObject({ layer: 1, kind: 'policy', projects: ['close'] });
		expect(toggle.meta).toMatchObject({ layer: 1, kind: 'policy', projects: ['toggle'] });

		const closeFixture = activationFixture('close', close);
		closeFixture.state.open = true;
		const ev = clickEvent();
		(closeFixture.atom.spread.onclick as (event: MouseEvent) => void)(ev);
		expect(closeFixture.state.open).toBe(false);
		expect(ev.stopPropagation).toHaveBeenCalled();

		const toggleFixture = activationFixture('toggle', toggle);
		(toggleFixture.atom.spread.onclick as (event: MouseEvent) => void)(clickEvent());
		expect(toggleFixture.state.open).toBe(true);
	});
});
