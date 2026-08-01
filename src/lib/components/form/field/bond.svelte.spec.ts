import { describe, expect, it } from 'vitest';
import { FieldBond, FieldBondState } from './bond.svelte';

// Unit verification of the role stitch; FieldBond avoids getContext so it's constructable in tests.
function makeField() {
	return new FieldBond(new FieldBondState({ disabled: false, readonly: false, extend: {} }));
}

describe('FieldBond — label ↔ control linkage via labelledControl', () => {
	it('control is labelled by the label; label `for` points at the control', () => {
		const bond = makeField();
		const label = bond.atom('label');
		const control = bond.atom('control');

		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
		expect(label.spread.for).toBe(control.spread.id);
		expect(label.spread.id).not.toBe(control.spread.id);
	});

	it('the group (root) is labelled by the label', () => {
		const bond = makeField();
		const label = bond.atom('label');
		const root = bond.atom('root');

		expect(root.spread.role).toBe('group');
		expect(root.spread['aria-labelledby']).toBe(label.spread.id);
	});

	it('keeps field-specific validation attrs on the control', () => {
		const bond = makeField();
		const control = bond.atom('control');

		expect(control.spread['aria-invalid']).toBe('false');
		expect(control.spread['aria-disabled']).toBe('false');
		expect(control.spread['aria-readonly']).toBe('false');
	});

	it('resolves regardless of which atom is created first (reactive registry)', () => {
		const bond = makeField();
		const control = bond.atom('control'); // control BEFORE label
		const label = bond.atom('label');
		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
		expect(label.spread.for).toBe(control.spread.id);
	});
});
