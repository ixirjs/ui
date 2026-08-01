import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/form/field/field-atom-probe.test.svelte';
import {
	FieldBond,
	FieldControlAtom,
	FieldDescriptionAtom,
	FieldLabelAtom,
	FieldRootAtom
} from './bond.svelte';

describe('Field component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered field nodes', () => {
		const { unmount } = render(Probe);
		const bond = capturedBond;

		expect(bond).toBeDefined();
		expect(bond).toBeInstanceOf(FieldBond);

		const root = bond?.nodeByPart('root');
		const label = bond?.nodeByPart('label');
		const control = bond?.nodeByPart('control');
		const description = bond?.nodeByPart('description');

		expect(root).toBeInstanceOf(FieldRootAtom);
		expect(label).toBeInstanceOf(FieldLabelAtom);
		expect(control).toBeInstanceOf(FieldControlAtom);
		expect(description).toBeInstanceOf(FieldDescriptionAtom);
		for (const node of [root, label, control, description]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(bond?.nodesByPart('root')).toEqual([root]);
		expect(bond?.nodesByPart('label')).toEqual([label]);
		expect(bond?.nodesByPart('control')).toEqual([control]);
		expect(bond?.nodesByPart('description')).toEqual([description]);

		expect(control?.spread['aria-labelledby']).toBe(label?.id);
		expect(label?.spread.for).toBe(control?.id);
		expect(root?.spread.role).toBe('group');
		expect(root?.spread['aria-labelledby']).toBe(label?.id);
		expect(root?.spread['aria-describedby']).toBe(description?.id);

		expect(bond?.nodeByPart('root')).toBeInstanceOf(FieldRootAtom);
		expect(bond?.nodeByPart('label')).toBeInstanceOf(FieldLabelAtom);
		expect(bond?.nodeByPart('control')).toBeInstanceOf(FieldControlAtom);
		expect(bond?.nodeByPart('description')).toBeInstanceOf(FieldDescriptionAtom);
		for (const node of [
			bond?.nodeByPart('root'),
			bond?.nodeByPart('label'),
			bond?.nodeByPart('control'),
			bond?.nodeByPart('description')
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		for (const part of ['root', 'label', 'control', 'description']) {
			expect(bond?.nodesByPart(part)).toEqual([]);
		}
	});
});
