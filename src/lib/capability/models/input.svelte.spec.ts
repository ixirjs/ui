import { describe, expect, it, vi } from 'vitest';
import { createInput } from './input.svelte';

describe('createInput', () => {
	it('reads and writes the primary field when none is named', () => {
		let query = '';
		const model = createInput({ query: { get: () => query, set: (v) => (query = v) } });

		expect(model.get()).toBe('');
		model.set('abc');
		expect(query).toBe('abc');
		expect(model.get()).toBe('abc');
		expect(model.get('query')).toBe('abc');
	});

	it('resolves a field by own keys only — an inherited name is not a field', () => {
		const set = vi.fn();
		const model = createInput({ query: { get: () => '', set } });

		// `toString` exists on Object.prototype; `Object.hasOwn` is what keeps it from resolving.
		expect(model.get('toString')).toBe('');
		model.set('ignored', 'toString');
		expect(set).not.toHaveBeenCalled();
	});

	it('clear empties a field and reports whether it had text', () => {
		let query = 'abc';
		const model = createInput({ query: { get: () => query, set: (v) => (query = v) } });

		expect(model.clear()).toBe(true);
		expect(query).toBe('');
		expect(model.clear()).toBe(false);
		expect(model.clear('missing')).toBe(false);
	});
});
