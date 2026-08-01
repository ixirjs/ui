import { describe, expect, it } from 'vitest';
import { CardBond } from './bond.svelte';

describe('CardBond', () => {
	it('creates the declared Bond and preserves its initial props', () => {
		const bond = CardBond.create({ clickable: true });

		expect(bond.props.clickable).toBe(true);
		expect(bond.name).toBe('card');
	});
});
