import { describe, expect, it } from 'vitest';
import { Bond, Atom, BondState, bondContextKey, type BondStateProps } from '../../bond';
import { checkedCapability, CHECKED, createChecked, type CheckedState } from './checked.svelte';

class TestState extends BondState<BondStateProps> {
	value = $state<CheckedState>(false);
	disabled = $state(false);

	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-checked');
	constructor(state = new TestState()) {
		super(state, 'test');
	}
	addAtom(key: string, role: string) {
		const atom = new TestAtom(this, key).role(role);
		this.register(atom, { key });
		return atom;
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key: string) {
		super(bond, key);
	}
}

describe('checkedCapability', () => {
	it('exposes a checked-state surface and projects checked attrs', () => {
		const state = new TestState();
		const checked = createChecked({
			get: () => state.value,
			set: (value) => (state.value = value),
			disabled: () => state.disabled
		});
		const cap = checkedCapability(checked);
		const bond = new TestBond(state);
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(CHECKED);
		expect(cap.surface).toBe(checked);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'model',
			projects: ['control']
		});
		expect(control.spread['aria-checked']).toBe('false');
		expect(control.spread['data-checked']).toBeUndefined();

		state.value = 'mixed';
		expect(checked.isMixed).toBe(true);
		expect(control.spread['aria-checked']).toBe('mixed');
		expect(control.spread['data-indeterminate']).toBe('');

		state.value = true;
		expect(checked.isChecked).toBe(true);
		expect(control.spread['aria-checked']).toBe('true');
		expect(control.spread['data-checked']).toBe('');
	});

	it('toggles from the projected click handler and respects disabled state', () => {
		const state = new TestState();
		const checked = createChecked({
			get: () => state.value,
			set: (value) => (state.value = value),
			disabled: () => state.disabled
		});
		const bond = new TestBond(state);
		bond.state.capability(checkedCapability(checked));
		const control = bond.addAtom('control', 'control');

		(control.spread.onclick as () => void)();
		expect(state.value).toBe(true);

		state.disabled = true;
		(control.spread.onclick as () => void)();
		expect(state.value).toBe(true);
		expect(control.spread['aria-disabled']).toBe('true');
	});
});
