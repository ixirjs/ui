import { describe, expect, it } from 'vitest';
import { AlertBond } from './bond.svelte';

describe('AlertBond', () => {
	it('creates the declared Bond and preserves its initial props', () => {
		const bond = AlertBond.create({ disabled: true });

		expect(bond.props.disabled).toBe(true);
		expect(bond.name).toBe('alert');
	});
});
