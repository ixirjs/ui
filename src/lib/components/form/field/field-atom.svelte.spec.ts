import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import Probe, { capturedBond, resetCapturedBond } from './field-atom-probe.svelte';
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

		const root = bond?.node('root');
		const label = bond?.node('label');
		const control = bond?.node('control');
		const description = bond?.node('description');

		expect(root).toBeInstanceOf(FieldRootAtom);
		expect(label).toBeInstanceOf(FieldLabelAtom);
		expect(control).toBeInstanceOf(FieldControlAtom);
		expect(description).toBeInstanceOf(FieldDescriptionAtom);
		for (const node of [root, label, control, description]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(bond?.nodes()).toHaveLength(4);

		expect(control?.spread['aria-labelledby']).toBe(label?.id);
		expect(label?.spread.for).toBe(control?.id);
		expect(root?.spread.role).toBe('group');
		expect(root?.spread['aria-labelledby']).toBe(label?.id);
		expect(root?.spread['aria-describedby']).toBe(description?.id);

		expect(typeof bond?.root).toBe('function');
		expect(typeof bond?.label).toBe('function');
		expect(typeof bond?.control).toBe('function');
		expect(typeof bond?.description).toBe('function');
		expect(bond?.root()).toBeInstanceOf(FieldRootAtom);
		expect(bond?.label()).toBeInstanceOf(FieldLabelAtom);
		expect(bond?.control()).toBeInstanceOf(FieldControlAtom);
		expect(bond?.description()).toBeInstanceOf(FieldDescriptionAtom);
		for (const node of [bond?.root(), bond?.label(), bond?.control(), bond?.description()]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(bond?.nodes()).toEqual([]);
	});
});
