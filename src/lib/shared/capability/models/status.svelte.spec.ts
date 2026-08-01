import { describe, expect, it } from 'vitest';
import { Bond, Atom, BondState, bondContextKey, type BondStateProps } from '../../bond';
import { createStatus, statusCapability, STATUS } from './status.svelte';

class TestState extends BondState<BondStateProps> {
	disabled = $state(false);
	readonly = $state(false);
	busy = $state(false);

	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-status');
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

describe('statusCapability', () => {
	it('exposes a scoped status surface and projects standard status attrs', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		const status = createStatus({
			disabled: () => state.disabled,
			readonly: () => state.readonly,
			busy: () => state.busy
		});
		const cap = statusCapability(status, { roles: ['control'] });
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(STATUS);
		expect(cap.surface).toBe(status);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'projection',
			projects: ['control']
		});
		expect(status.is('disabled')).toBe(false);
		expect(control.spread['aria-disabled']).toBe('false');
		expect(control.spread['data-disabled']).toBeUndefined();

		state.disabled = true;
		state.readonly = true;
		state.busy = true;
		expect(status.is('disabled')).toBe(true);
		expect(control.spread['aria-disabled']).toBe('true');
		expect(control.spread['aria-readonly']).toBe('true');
		expect(control.spread['aria-busy']).toBe('true');
		expect(control.spread['data-disabled']).toBe('');
		expect(control.spread['data-readonly']).toBe('');
		expect(control.spread['data-busy']).toBe('');
	});

	it('only projects the configured statuses and roles', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.state.capability(
			statusCapability(createStatus({ disabled: () => state.disabled, busy: () => state.busy }), {
				roles: ['button'],
				statuses: ['disabled']
			})
		);
		const button = bond.addAtom('button', 'button');
		const control = bond.addAtom('control', 'control');

		state.disabled = true;
		state.busy = true;
		expect(button.spread['aria-disabled']).toBe('true');
		expect(button.spread['aria-busy']).toBeUndefined();
		expect(control.spread['aria-disabled']).toBeUndefined();
	});
});
