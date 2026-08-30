import { describe, expect, it } from 'vitest';
import { FieldBond } from './bond.svelte';
import { defineSchema } from '$ixirjs/ui/validation';

// The Bond's own logic, constructed outside a component. The ARIA it used to project through
// Atoms is asserted on rendered elements in `field-atom.svelte.spec.ts` and `field-a11y.svelte.spec.ts`.
function makeField(extra: Partial<Parameters<typeof FieldBond.create>[0]> = {}) {
	return FieldBond.create({ disabled: false, readonly: false, extend: {}, ...extra });
}

describe('FieldBond — validation state', () => {
	it('starts valid and turns invalid when its own schema rejects the value', () => {
		const bond = makeField({ schema: defineSchema(() => 'Required') });

		expect(bond.isInvalid).toBe(false);
		expect(bond.status.is('invalid')).toBe(false);

		bond.validate();
		expect(bond.isInvalid).toBe(true);
		expect(bond.errors[0]?.message).toBe('Required');
		expect(bond.status.is('invalid')).toBe(true);

		bond.clear();
		expect(bond.isInvalid).toBe(false);
	});

	it('reports required only when the field is required', () => {
		expect(makeField().status.is('required')).toBe(false);
		expect(makeField({ required: true }).status.is('required')).toBe(true);
	});

	it('tracks dirty against the mounted value and touched against interaction', () => {
		const bond = makeField({ value: 'start' });
		expect(bond.isDirty).toBe(false);
		expect(bond.isTouched).toBe(false);

		bond.props.value = 'changed';
		expect(bond.isDirty).toBe(true);
		expect(bond.isTouched).toBe(false);

		bond.markTouched();
		expect(bond.isTouched).toBe(true);

		bond.resetInteraction();
		expect(bond.isDirty).toBe(false);
		expect(bond.isTouched).toBe(false);
	});
});
