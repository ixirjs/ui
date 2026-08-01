import { describe, expect, it } from 'vitest';
import {
	Bond,
	BondState,
	Atom,
	bondContextKey,
	capabilityKey,
	type BondStateProps
} from '../../bond';
import { createSelection, selectionCapability, SELECTION } from './selection.svelte';

// End-to-end proof of the role stitch: atom declares .role(...), bond folds in capability
// projections — the atom binds to a capability surface, never to a concrete component.

// Minimal concrete trio. State owns reactive cells directly (no defineState).
class TestState extends BondState<BondStateProps> {
	values = $state<string[]>([]);
	multiple = $state(true);
	selection = createSelection<string>({
		get: () => this.values,
		set: (v) => (this.values = v),
		mode: () => (this.multiple ? 'multiple' : 'single')
	});
	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-stitch');
	constructor(state: TestState) {
		super(state, 'test');
	}

	override get state(): TestState {
		return super.state as TestState;
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key = 'item') {
		super(bond, key);
	}
}

function makeBond() {
	const bond = new TestBond(new TestState());
	bond.state.capability(selectionCapability(bond.state.selection));
	return bond;
}

describe('role stitch — selection projected onto an atom', () => {
	it('item role projects aria-selected / data-selected + a committing onclick', () => {
		const bond = makeBond();
		const atom = new TestAtom(bond).role('item', 'a');

		expect(atom.spread['aria-selected']).toBe(false);
		expect(atom.spread['data-selected']).toBeUndefined(); // present-only: absent when unselected

		(atom.spread.onclick as () => void)();
		expect(bond.state.values).toEqual(['a']);
		// spread re-reads the model live → now selected
		expect(atom.spread['aria-selected']).toBe(true);
		expect(atom.spread['data-selected']).toBe(''); // present when selected

		(atom.spread.onclick as () => void)(); // toggle off
		expect(bond.state.values).toEqual([]);
	});

	it('container role projects aria-multiselectable from the model mode', () => {
		const bond = makeBond();
		const container = new TestAtom(bond, 'root').role('container');
		expect(container.spread['aria-multiselectable']).toBe(true);
		bond.state.multiple = false;
		expect(container.spread['aria-multiselectable']).toBe(false);
	});

	it('the SAME projection drives independent bonds without coupling them', () => {
		const a = makeBond();
		const b = makeBond();
		const ai = new TestAtom(a).role('item', 'x');
		const bi = new TestAtom(b).role('item', 'x');

		(ai.spread.onclick as () => void)();
		expect(a.state.values).toEqual(['x']);
		expect(b.state.values).toEqual([]); // independent
		expect(ai.spread['aria-selected']).toBe(true);
		expect(bi.spread['aria-selected']).toBe(false);
	});

	it('a bond holding no capability makes .role() a harmless no-op', () => {
		const bond = new TestBond(new TestState()); // no bond.state.capability(...)
		const atom = new TestAtom(bond).role('item', 'a');
		expect(atom.spread['aria-selected']).toBeUndefined();
		expect(atom.spread.onclick).toBeUndefined();
	});

	it('respects projection options (commit: select, custom aria)', () => {
		const bond = new TestBond(new TestState());
		bond.state.multiple = false;
		bond.state.capability(
			selectionCapability(bond.state.selection, { commit: 'select', aria: 'aria-checked' })
		);
		const a = new TestAtom(bond).role('item', 'a');
		const b = new TestAtom(bond).role('item', 'b');

		(a.spread.onclick as () => void)();
		expect(bond.state.values).toEqual(['a']);
		(b.spread.onclick as () => void)(); // select replaces (single mode)
		expect(bond.state.values).toEqual(['b']);
		expect(b.spread['aria-checked']).toBe(true);
		expect(b.spread['aria-selected']).toBeUndefined();
	});

	it('bond.state.capability(key) retrieves the held surface', () => {
		const bond = makeBond();
		expect(bond.state.capability(SELECTION)?.surface).toBe(bond.state.selection);
		expect(bond.state.capability(capabilityKey('nope'))).toBeUndefined();
	});
});

describe('slot resolution — use() is last-wins-per-slot (§13.1)', () => {
	// Test-local slot keys; identity (not string) drives find/last-wins.
	const SLOT_A = capabilityKey<string>('slot-a');
	const SLOT_B = capabilityKey<string>('slot-b');
	const cap = (slot: symbol, tag: string) => ({
		slot,
		surface: tag,
		behavior: () => ({ attrs: () => ({ 'data-tag': tag }) })
	});

	it('re-registering a slot REPLACES the prior capability (override seam)', () => {
		const bond = new TestBond(new TestState());
		bond.state.capability(cap(SLOT_A, 'first'));
		bond.state.capability(cap(SLOT_A, 'second'));
		expect(bond.state.capability(SLOT_A)?.surface).toBe('second');
		// only the survivor projects onto an atom
		const atom = new TestAtom(bond, 'a').role('surface');
		expect(atom.spread['data-tag']).toBe('second');
	});

	it('distinct slots both register (no-op for non-collisions)', () => {
		const bond = new TestBond(new TestState());
		bond.state.capability(cap(SLOT_A, 'T'));
		bond.state.capability(cap(SLOT_B, 'E'));
		expect(bond.state.capability(SLOT_A)?.surface).toBe('T');
		expect(bond.state.capability(SLOT_B)?.surface).toBe('E');
	});
});
