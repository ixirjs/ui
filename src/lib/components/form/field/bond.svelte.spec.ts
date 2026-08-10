import { describe, expect, it } from 'vitest';
import { Atom } from '$ixirjs/ui/shared/bond';
import {
	FieldBond,
	FieldControlAtom,
	FieldDescriptionAtom,
	FieldErrorAtom,
	FieldLabelAtom,
	FieldRootAtom
} from './bond.svelte';
import { VALIDATION } from '$ixirjs/ui/shared/capability/models/validation.svelte';
import { defineSchema } from '$ixirjs/ui/shared/validation';
import { STATUS } from '$ixirjs/ui/shared/capability/models/status.svelte';

// Unit verification of the role stitch; FieldBond avoids getContext so it's constructable in tests.
function makeField() {
	return FieldBond.create({ disabled: false, readonly: false, extend: {} });
}

function fieldAtom(bond: FieldBond, key: 'root' | 'label' | 'control' | 'description' | 'error') {
	const atom =
		key === 'root'
			? new FieldRootAtom(bond)
			: key === 'label'
				? new FieldLabelAtom(bond).role('label')
				: key === 'control'
					? new FieldControlAtom(bond).role('control')
					: key === 'error'
						? new FieldErrorAtom(bond).role('error')
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

		// The published surface is the merged view, not the field's own model: a form-level error
		// routed to this field must reach anything reading the VALIDATION slot, not just `Field.Error`.
		const surface = bond.capability(VALIDATION)?.surface;
		expect(surface).not.toBe(bond.validation);
		expect(surface?.errors).toEqual(bond.errors);
		expect(surface?.isInvalid).toBe(bond.isInvalid);
		expect(bond.capability(VALIDATION)?.meta).toMatchObject({
			projects: ['control', 'error']
		});
		expect(bond.capability(STATUS)?.surface).toBe(bond.status);
		expect(bond.capability(STATUS)?.meta).toMatchObject({
			projects: ['control']
		});
	});

	it('validation updates control attrs and error message linkage through capabilities', () => {
		const bond = FieldBond.create({
			disabled: false,
			readonly: false,
			extend: {},
			schema: defineSchema(() => 'Required')
		});
		const control = fieldAtom(bond, 'control');
		// The error message target is its own part now — the helper text (`description`) no longer
		// doubles as it, so `aria-errormessage` points at error text rather than at prose.
		const error = fieldAtom(bond, 'error');

		expect(control.spread['aria-invalid']).toBe('false');
		expect(control.spread['aria-errormessage']).toBeUndefined();

		bond.validate();
		expect(control.spread['aria-invalid']).toBe('true');
		expect(control.spread['data-invalid']).toBe('');
		expect(control.spread['aria-errormessage']).toBe(error.spread.id);
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
		expect(bond.nodeByPart('root')).toBe(root);
		expect(bond.nodeByPart('label')).toBe(label);
		expect(bond.nodeByPart('control')).toBe(control);
		expect(bond.nodeByPart('description')).toBe(description);
		expect(control.spread['aria-labelledby']).toBe(label.id);
		expect(label.spread.for).toBe(control.id);
		expect(root.spread['aria-labelledby']).toBe(label.id);
		expect(root.spread['aria-describedby']).toBe(description.id);

		for (let i = unmounts.length - 1; i >= 0; i--) unmounts[i]!();
		for (const part of ['root', 'label', 'control', 'description']) {
			expect(bond.nodesByPart(part)).toEqual([]);
		}
	});
});

// `required` is a field-level status like disabled and readonly, and belongs on the control, not
// only on the wrapping group.
describe('FieldBond — required projects onto the control', () => {
	it('emits aria-required only when the field is required', () => {
		const optional = fieldAtom(makeField(), 'control');
		expect(optional.spread['aria-required']).toBeUndefined();

		const bond = FieldBond.create({
			disabled: false,
			readonly: false,
			required: true,
			extend: {}
		});
		expect(fieldAtom(bond, 'control').spread['aria-required']).toBe('true');
	});
});
