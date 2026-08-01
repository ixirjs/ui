import { describe, expect, it } from 'vitest';
import { Bond, Atom, BondState, bondContextKey, type BondStateProps } from '../../bond';
import {
	currentProjection,
	CURRENT_PROJECTION,
	disabledProjection,
	DISABLED_PROJECTION,
	orientationProjection,
	ORIENTATION_PROJECTION
} from '.';

class TestState extends BondState<BondStateProps> {
	orientation = $state<'horizontal' | 'vertical'>('horizontal');
	disabled = $state(false);
	current = $state('settings');

	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-role-projections');
	constructor(state = new TestState()) {
		super(state, 'test');
	}
	addAtom(key: string, role: string, ctx?: unknown) {
		const atom = new TestAtom(this, key).role(role, ctx);
		this.register(atom, { key });
		return atom;
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key: string) {
		super(bond, key);
	}
}

describe('role projection primitives', () => {
	it('orientationProjection projects generic horizontal/vertical attrs', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		const cap = orientationProjection({
			orientation: () => state.orientation
		});
		bond.state.capability(cap);
		const container = bond.addAtom('container', 'container');

		expect(cap.slot).toBe(ORIENTATION_PROJECTION);
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'projection',
			projects: ['container']
		});
		expect(container.spread['aria-orientation']).toBe('horizontal');
		expect(container.spread['data-orientation']).toBe('horizontal');

		state.orientation = 'vertical';
		expect(container.spread['aria-orientation']).toBe('vertical');
		expect(container.spread['data-orientation']).toBe('vertical');
	});

	it('disabledProjection projects ARIA, native disabled, and tabindex guard attrs', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		const cap = disabledProjection({
			roles: ['control', 'item'],
			disabled: (ctx) => state.disabled || ctx === 'locked',
			native: ['control']
		});
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control');
		const item = bond.addAtom('item', 'item', 'locked');

		expect(cap.slot).toBe(DISABLED_PROJECTION);
		expect(control.spread['aria-disabled']).toBeUndefined();
		expect(item.spread['aria-disabled']).toBe('true');
		expect(item.spread.disabled).toBeUndefined();
		expect(item.spread.tabindex).toBe(-1);

		state.disabled = true;
		expect(control.spread['aria-disabled']).toBe('true');
		expect(control.spread.disabled).toBe(true);
		expect(control.spread['data-disabled']).toBe('');
	});

	it('currentProjection projects aria-current per role context', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		const cap = currentProjection({
			current: (ctx) => (ctx === state.current ? 'page' : undefined)
		});
		bond.state.capability(cap);
		const home = bond.addAtom('home', 'item', 'home');
		const settings = bond.addAtom('settings', 'item', 'settings');

		expect(cap.slot).toBe(CURRENT_PROJECTION);
		expect(home.spread['aria-current']).toBeUndefined();
		expect(settings.spread['aria-current']).toBe('page');
		expect(settings.spread['data-current']).toBe('');
		expect(settings.spread['data-current-value']).toBe('page');

		state.current = 'home';
		expect(home.spread['aria-current']).toBe('page');
		expect(settings.spread['aria-current']).toBeUndefined();
	});
});
