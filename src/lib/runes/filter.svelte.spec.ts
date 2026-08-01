import { describe, expect, it } from 'vitest';
import { createFilter } from './filter.svelte';

type Item = { id: string; label: string };

const ITEMS: Item[] = [
	{ id: 'a', label: 'Apple' },
	{ id: 'b', label: 'Banana' },
	{ id: 'c', label: 'Cherry' },
	{ id: 'd', label: 'apricot' }
];

describe('createFilter — text-accessor matcher (case-insensitive substring)', () => {
	it('passes through the source when the query is empty (same reference, no alloc)', () => {
		const data = ITEMS;
		const f = createFilter(
			() => data,
			(i) => i.label
		);
		expect(f.current).toBe(data); // identity — no allocation on empty query
		expect(f.count).toBe(4);
		expect(f.active).toBe(false);
		expect(f.empty).toBe(false);
	});

	it('filters case-insensitively', () => {
		const f = createFilter(
			() => ITEMS,
			(i) => i.label
		);
		f.query = 'ap';
		expect(f.current.map((i) => i.id)).toEqual(['a', 'd']); // Apple, apricot
		expect(f.count).toBe(2);
		expect(f.active).toBe(true);
		expect(f.empty).toBe(false);
	});

	it('trims/normalises the query', () => {
		const f = createFilter(
			() => ITEMS,
			(i) => i.label
		);
		f.query = '  CHERRY  ';
		expect(f.current.map((i) => i.id)).toEqual(['c']);
	});

	it('reports the empty (no-results) state', () => {
		const f = createFilter(
			() => ITEMS,
			(i) => i.label
		);
		f.query = 'zzz';
		expect(f.count).toBe(0);
		expect(f.active).toBe(true);
		expect(f.empty).toBe(true);
	});

	it('clear() resets the query', () => {
		const f = createFilter(
			() => ITEMS,
			(i) => i.label
		);
		f.query = 'ap';
		f.clear();
		expect(f.query).toBe('');
		expect(f.count).toBe(4);
	});
});

describe('createFilter — key calculation (universe vs rendered subset)', () => {
	it('`keys` is the full source universe (ignores the query); `currentKeys` is the filtered subset', () => {
		const f = createFilter(
			() => ITEMS,
			(i) => i.label,
			{ key: (i) => i.id }
		);
		expect(f.keys).toEqual(['a', 'b', 'c', 'd']); // universe, unfiltered
		f.query = 'ap';
		expect(f.keys).toEqual(['a', 'b', 'c', 'd']); // still the universe
		expect(f.currentKeys).toEqual(['a', 'd']); // only the matches
	});

	it('`keys` tracks a reactive source', () => {
		const data = $state<Item[]>([{ id: 'a', label: 'Apple' }]);
		const f = createFilter(
			() => data,
			(i) => i.label,
			{ key: (i) => i.id }
		);
		expect(f.keys).toEqual(['a']);
		data.push({ id: 'b', label: 'Banana' });
		expect(f.keys).toEqual(['a', 'b']);
	});

	it('`keys`/`currentKeys` are empty without a key accessor', () => {
		const f = createFilter(
			() => ITEMS,
			(i) => i.label
		);
		expect(f.keys).toEqual([]);
		expect(f.currentKeys).toEqual([]);
	});
});

describe('createFilter — {match} predicate (normalised query)', () => {
	it('receives the trimmed + lowercased query', () => {
		const f = createFilter(() => ITEMS, {
			match: (item, q) => item.label.toLowerCase().startsWith(q)
		});
		f.query = '  Ap ';
		expect(f.current.map((i) => i.id)).toEqual(['a', 'd']); // startsWith 'ap'
	});
});

describe('createFilter — reactive source + external query binding', () => {
	it('tracks a reactive source', () => {
		const data = $state<Item[]>([{ id: 'a', label: 'Apple' }]);
		const f = createFilter(
			() => data,
			(i) => i.label
		);
		f.query = 'ban';
		expect(f.count).toBe(0);
		data.push({ id: 'b', label: 'Banana' });
		expect(f.current.map((i) => i.id)).toEqual(['b']); // re-derives on source change
	});

	it('binds the query to external storage', () => {
		const box = $state({ q: '' });
		const f = createFilter(
			() => ITEMS,
			(i) => i.label,
			{
				query: {
					get: () => box.q,
					set: (v) => (box.q = v)
				}
			}
		);
		f.query = 'cher';
		expect(box.q).toBe('cher'); // write goes through the binding
		expect(f.current.map((i) => i.id)).toEqual(['c']);
		box.q = ''; // external write reflects (no debounce → reads getter directly)
		expect(f.count).toBe(4);
	});
});
