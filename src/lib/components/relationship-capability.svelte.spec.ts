import { describe, expect, it } from 'vitest';
import {
	FieldBond,
	FieldControlAtom,
	FieldDescriptionAtom,
	type ValidationAdapter
} from './form/field/bond.svelte';
import { TreeBond } from './tree/bond.svelte';
import {
	ERROR_MESSAGE,
	TREE_ITEM_GROUP
} from '$svelte-atoms/core/shared/capability/models/relationship.svelte';

describe('relationship capability call sites', () => {
	it('field controls use a real helper/error message atom for descriptions and errors', () => {
		const validator: ValidationAdapter<unknown, unknown> = {
			validate: () => ({
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
		const control = new FieldControlAtom(bond).role('control');
		const description = new FieldDescriptionAtom(bond).role('description');
		bond.register(control, { key: 'control' });
		bond.register(description, { key: 'description' });

		expect(bond.capability(ERROR_MESSAGE)?.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['control', 'error']
		});
		expect(control.spread['aria-describedby']).toBe(description.spread.id);
		expect(control.spread['aria-errormessage']).toBeUndefined();

		bond.validate();
		expect(control.spread['aria-invalid']).toBe('true');
		expect(control.spread['aria-errormessage']).toBe(description.spread.id);
	});

	it('tree registers treeItemGroupLink separately from disclosure activation', () => {
		const props = $state({ open: false, disabled: false });
		const bond = TreeBond.create(props);

		expect(bond.capability(TREE_ITEM_GROUP)?.meta).toMatchObject({
			layer: 1,
			kind: 'relationship',
			projects: ['treeitem', 'treegroup']
		});
	});
});
