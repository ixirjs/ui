import { describe, expect, it } from 'vitest';
import { Atom } from '$svelte-atoms/core/shared/bond';
import {
	FieldBond,
	FieldControlAtom,
	FieldDescriptionAtom,
	FieldLabelAtom,
	FieldRootAtom,
	type ValidationAdapter
} from './bond.svelte';
import {
	VALIDATION,
	type ValidationResult
} from '$svelte-atoms/core/shared/capability/models/validation.svelte';
import { STATUS } from '$svelte-atoms/core/shared/capability/models/status.svelte';

// Unit verification of the role stitch; FieldBond avoids getContext so it's constructable in tests.
function makeField() {
	return FieldBond.create({ disabled: false, readonly: false, extend: {} });
}

function fieldAtom(bond: FieldBond, key: 'root' | 'label' | 'control' | 'description') {
	const atom =
		key === 'root'
			? new FieldRootAtom(bond)
			: key === 'label'
				? new FieldLabelAtom(bond).role('label')
				: key === 'control'
					? new FieldControlAtom(bond).role('control')
					: new FieldDescriptionAtom(bond).role('description');
	bond.register(atom, { key });
	return atom;
}

describe('FieldBond — label ↔ control linkage via labelledControl', () => {
	it('control is labelled by the label; label `for` points at the control', () => {
		const bond = makeField();
		const label = fieldAtom(bond, 'label');
		const control = fieldAtom(bond, 'control');

		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
		expect(label.spread.for).toBe(control.spread.id);
		expect(label.spread.id).not.toBe(control.spread.id);
	});

	it('the group (root) is labelled by the label', () => {
		const bond = makeField();
		const label = fieldAtom(bond, 'label');
		const root = fieldAtom(bond, 'root');

		expect(root.spread.role).toBe('group');
		expect(root.spread['aria-labelledby']).toBe(label.spread.id);
	});

	it('keeps field-specific validation attrs on the control', () => {
		const bond = makeField();
		const control = fieldAtom(bond, 'control');

		expect(control.spread['aria-invalid']).toBe('false');
		expect(control.spread['data-invalid']).toBeUndefined();
		expect(control.spread['aria-disabled']).toBe('false');
		expect(control.spread['aria-readonly']).toBe('false');
	});

	it('registers validation and status as Layer 1 capabilities', () => {
		const bond = makeField();

		expect(bond.state.capability(VALIDATION)?.surface).toBe(bond.validation);
		expect(bond.state.capability(VALIDATION)?.meta).toMatchObject({
			layer: 1,
			kind: 'model',
			projects: ['control', 'error']
		});
		expect(bond.state.capability(STATUS)?.surface).toBe(bond.status);
		expect(bond.state.capability(STATUS)?.meta).toMatchObject({
			layer: 1,
			kind: 'projection',
			projects: ['control']
		});
	});

	it('validation updates control attrs and error message linkage through capabilities', () => {
		const validator: ValidationAdapter<unknown, unknown> = {
			validate: (): ValidationResult => ({
				success: false,
				errors: [{ path: [], message: 'Required' }]
			})
		};
		const bond = FieldBond.create({
			disabled: false,
			readonly: false,
			extend: {},
			schema: {},
			validator
		});
		const control = fieldAtom(bond, 'control');
		const description = fieldAtom(bond, 'description');

		expect(control.spread['aria-invalid']).toBe('false');
		expect(control.spread['aria-errormessage']).toBeUndefined();

		bond.validate();
		expect(control.spread['aria-invalid']).toBe('true');
		expect(control.spread['data-invalid']).toBe('');
		expect(control.spread['aria-errormessage']).toBe(description.spread.id);
	});

	it('resolves regardless of which atom is created first (reactive registry)', () => {
		const bond = makeField();
		const control = fieldAtom(bond, 'control'); // control BEFORE label
		const label = fieldAtom(bond, 'label');
		expect(control.spread['aria-labelledby']).toBe(label.spread.id);
		expect(label.spread.for).toBe(control.spread.id);
	});

	it('registered Atoms drive field relationships without legacy atom subclasses', () => {
		const bond = makeField();
		const root = new FieldRootAtom(bond);
		const label = new FieldLabelAtom(bond).role('label');
		const control = new FieldControlAtom(bond).role('control');
		const description = new FieldDescriptionAtom(bond).role('description');
		const unmounts = [
			bond.register(root),
			bond.register(label),
			bond.register(control),
			bond.register(description)
		];

		for (const node of [root, label, control, description]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(bond.node('root')).toBe(root);
		expect(bond.node('label')).toBe(label);
		expect(bond.node('control')).toBe(control);
		expect(bond.node('description')).toBe(description);
		expect(control.spread['aria-labelledby']).toBe(label.id);
		expect(label.spread.for).toBe(control.id);
		expect(root.spread['aria-labelledby']).toBe(label.id);
		expect(root.spread['aria-describedby']).toBe(description.id);

		for (let i = unmounts.length - 1; i >= 0; i--) unmounts[i]!();
		expect(bond.nodes()).toEqual([]);
	});
});
