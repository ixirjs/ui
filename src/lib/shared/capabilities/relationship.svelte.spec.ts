import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { Bond, BondState, BondAtom, bondContextKey, type BondStateProps } from '../bond.svelte';
import { createDisclosure } from './disclosure.svelte';
import { triggerContentLink, labelledControl } from './relationship.svelte';

class TestState extends BondState<BondStateProps> {
	open = $state(false);
	disclosure = createDisclosure({
		get: () => this.open,
		set: (v) => (this.open = v)
	});
	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps, TestState> {
	static CONTEXT_KEY = bondContextKey('test-relationship');
	constructor(state: TestState) {
		super(state, 'test');
	}
	// Register a TestAtom under `key` playing `role` via the production registry path.
	addAtom(key: string, role: string, ctx?: unknown): BondAtom {
		this.registerAtom(key, (b) => new TestAtom(b as TestBond, key).role(role, ctx));
		return this.atom(key);
	}
}

class TestAtom extends BondAtom<TestBond> {
	constructor(bond: TestBond, key: string) {
		super(bond, key);
	}
}

function makeBond() {
	const bond = new TestBond(new TestState());
	bond.capability(triggerContentLink(bond.state.disclosure, { contentRole: 'region' }));
	return bond;
}

describe('triggerContentLink — reusable trigger ↔ content a11y linkage', () => {
	it('cross-references ids both ways via atomByRole', () => {
		const bond = makeBond();
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		const content = bond.addAtom('panel', 'content');

		// trigger points at content's id; content points back at trigger's id
		expect(trigger.spread['aria-controls']).toBe(content.spread.id);
		expect(content.spread['aria-labelledby']).toBe(trigger.spread.id);
		expect(content.spread.id).not.toBe(trigger.spread.id); // distinct atoms
	});

	it('projects aria-expanded from the disclosure, reactively', () => {
		const bond = makeBond();
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		bond.addAtom('panel', 'content');

		expect(trigger.spread['aria-expanded']).toBe(false);
		bond.state.disclosure.open();
		expect(trigger.spread['aria-expanded']).toBe(true);

		// reactive: a $derived over the spread recomputes on toggle
		let expanded: unknown;
		const dispose = $effect.root(() => {
			$effect(() => {
				expanded = trigger.spread['aria-expanded'];
			});
		});
		flushSync();
		bond.state.disclosure.close();
		flushSync();
		expect(expanded).toBe(false);
		dispose();
	});

	it('applies options (contentRole, haspopup)', () => {
		const bond = new TestBond(new TestState());
		bond.capability(triggerContentLink(bond.state.disclosure, { haspopup: 'menu', contentRole: 'region' }));
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		const content = bond.addAtom('panel', 'content');
		expect(trigger.spread['aria-haspopup']).toBe('menu');
		expect(content.spread.role).toBe('region');
	});

	it('resolves regardless of registration order', () => {
		const bond = makeBond();
		// content declared BEFORE trigger
		const content = bond.addAtom('panel', 'content');
		const trigger = bond.addAtom('trigger-btn', 'trigger');
		expect(trigger.spread['aria-controls']).toBe(content.spread.id);
		expect(content.spread['aria-labelledby']).toBe(trigger.spread.id);
	});
});

describe('labelledControl — label/description → control (field pattern)', () => {
	function fieldBond(opts = {}) {
		const bond = new TestBond(new TestState());
		bond.capability(labelledControl(opts));
		return bond;
	}

	it('control references its label and description ids', () => {
		const bond = fieldBond();
		const label = bond.addAtom('lbl', 'label');
		const control = bond.addAtom('ctl', 'control');
		const description = bond.addAtom('desc', 'description');

		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
		expect(control.spread['aria-describedby']).toBe(description.spread.id);
	});

	it('omits a reference when the sibling is absent', () => {
		const bond = fieldBond();
		const label = bond.addAtom('lbl', 'label');
		const control = bond.addAtom('ctl', 'control');
		// no description atom
		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
		expect(control.spread['aria-describedby']).toBeUndefined();
	});

	it('nativeFor emits `for` on the label pointing at the control', () => {
		const bond = fieldBond({ nativeFor: true });
		const label = bond.addAtom('lbl', 'label');
		const control = bond.addAtom('ctl', 'control');
		expect(label.spread.for).toBe(control.spread.id);
	});
});
