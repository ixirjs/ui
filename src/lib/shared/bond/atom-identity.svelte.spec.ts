import { describe, expect, it } from 'vitest';
import { Atom } from './atom.svelte';
import { Bond } from './bond.svelte';

class IdentityBond extends Bond {
	constructor(props: Record<string, unknown>) {
		super(props, 'identity-probe');
	}
}

/** Mirrors bindBond's non-enumerable `$props.id()` seed: fixed for the component's lifetime. */
function seededProps(id: string): Record<string, unknown> {
	const props = {};
	Object.defineProperty(props, 'id', { get: () => id, enumerable: false, configurable: true });
	return props;
}

/** Mirrors an `id` cell declared in a props spec (DataGrid.Column): consumer-driven, can change. */
function cellProps(read: () => string): Record<string, unknown> {
	const props = {};
	Object.defineProperty(props, 'id', { get: read, enumerable: true, configurable: true });
	return props;
}

describe('Atom identity', () => {
	it('tracks a Bond whose id is a props cell', () => {
		let id = 'first';
		const bond = new IdentityBond(cellProps(() => id));
		const atom = new Atom(bond, 'header');

		const before = atom.id;
		expect(before).toContain('first');

		// A consumer rebinding the root's `id` has to move the element ids the relationship
		// capabilities reference; a snapshot taken at construction leaves aria-* wiring pointing at
		// an id no element carries any more.
		id = 'second';
		expect(atom.id).not.toBe(before);
		expect(atom.id).toContain('second');
	});

	it('keeps one constant id for the ordinary seeded Bond', () => {
		const bond = new IdentityBond(seededProps('seed'));
		const atom = new Atom(bond, 'header');

		expect(atom.id).toContain('seed');
		expect(atom.id).toBe(atom.id);
	});

	it('lets an explicitly bound id source win over both', () => {
		const bond = new IdentityBond(seededProps('seed'));
		const atom = new Atom(bond, 'header');

		atom.bindId(() => 'consumer-owned');
		expect(atom.id).toBe('consumer-owned');

		// Falling back when the consumer passes no id keeps the Atom's own identity authoritative.
		atom.bindId(() => undefined);
		expect(atom.id).toContain('seed');
	});
});
