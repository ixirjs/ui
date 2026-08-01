import { describe, expect, it } from 'vitest';
import { RootBond } from './bond.svelte';

describe('RootBond', () => {
	it('creates the provider Bond with its renderer extension', () => {
		const renderers = {};
		const bond = new RootBond({ extend: {}, renderers });

		expect(bond.props.renderers).toBe(renderers);
		expect(bond.rootElement).toBeUndefined();
	});
});
