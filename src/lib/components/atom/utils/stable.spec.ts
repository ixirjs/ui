import { describe, expect, it } from 'vitest';
import { stabilizePresetRecord, structurallyEqual } from './stable';
import { resolveVariants } from './variants';

describe('structurallyEqual', () => {
	it('matches identical primitives and references', () => {
		expect(structurallyEqual('a', 'a')).toBe(true);
		expect(structurallyEqual(1, 1)).toBe(true);
		expect(structurallyEqual('a', 'b')).toBe(false);
		const fn = () => {};
		expect(structurallyEqual(fn, fn)).toBe(true);
	});

	it('compares functions by reference only', () => {
		expect(
			structurallyEqual(
				() => {},
				() => {}
			)
		).toBe(false);
	});

	it('matches structurally equal nested records (the preset-record shape)', () => {
		const make = () => ({
			class: 'flex px-3',
			variants: { variant: { primary: 'bg-primary', outline: 'border' } },
			compounds: [{ variant: 'primary', size: 'sm', class: 'compound' }],
			defaults: { variant: 'primary' }
		});
		expect(structurallyEqual(make(), make())).toBe(true);
	});

	it('detects a changed nested value', () => {
		const a = { variants: { variant: { primary: 'bg-primary' } } };
		const b = { variants: { variant: { primary: 'bg-secondary' } } };
		expect(structurallyEqual(a, b)).toBe(false);
	});

	it('detects added/removed keys and array length changes', () => {
		expect(structurallyEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
		expect(structurallyEqual([1, 2], [1, 2, 3])).toBe(false);
		expect(structurallyEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
	});

	it('compares symbol-keyed props (by key identity and value)', () => {
		const sym = Symbol('attachment');
		const fn = () => {};
		expect(structurallyEqual({ [sym]: fn }, { [sym]: fn })).toBe(true);
		expect(structurallyEqual({ [sym]: fn }, { [sym]: () => {} })).toBe(false);
		expect(structurallyEqual({ [sym]: fn }, {})).toBe(false);
	});

	it('treats non-plain objects as reference-equal only', () => {
		expect(structurallyEqual(new Date(0), new Date(0))).toBe(false);
		class Box {
			x = 1;
		}
		expect(structurallyEqual(new Box(), new Box())).toBe(false);
	});
});

describe('stabilizePresetRecord', () => {
	const NO_BOND = null;

	it('returns the previous record reference when content is unchanged', () => {
		const entry = () => {};
		const first = stabilizePresetRecord(entry, NO_BOND, {
			class: 'a',
			variants: { v: { x: 'cls' } }
		});
		const second = stabilizePresetRecord(entry, NO_BOND, {
			class: 'a',
			variants: { v: { x: 'cls' } }
		});
		expect(second).toBe(first);
	});

	it('returns the fresh record when content changed', () => {
		const entry = () => {};
		const first = stabilizePresetRecord(entry, NO_BOND, { class: 'a' });
		const second = stabilizePresetRecord(entry, NO_BOND, { class: 'b' });
		expect(second).not.toBe(first);
		expect(second.class).toBe('b');
	});

	it('grafts unchanged cache-keyed fields when a sibling field changed', () => {
		const entry = () => {};
		const first = stabilizePresetRecord(entry, NO_BOND, {
			class: 'a',
			variants: { v: { x: 'cls' } },
			defaults: { v: 'x' }
		});
		// class changed, but variants/defaults content did not → their previous
		// references must be retained so reference-keyed caches keep hitting.
		const second = stabilizePresetRecord(entry, NO_BOND, {
			class: 'CHANGED',
			variants: { v: { x: 'cls' } },
			defaults: { v: 'x' }
		});
		expect(second).not.toBe(first);
		expect(second.variants).toBe(first.variants);
		expect(second.defaults).toBe(first.defaults);
		expect(second.class).toBe('CHANGED');
	});

	it('scopes memoization per (entry, bond) pair', () => {
		const entryA = () => {};
		const entryB = () => {};
		const recA = stabilizePresetRecord(entryA, NO_BOND, { class: 'same' });
		const recB = stabilizePresetRecord(entryB, NO_BOND, { class: 'same' });
		expect(recA).not.toBe(recB); // different entries never share identity

		const bond = {} as never;
		const recNoBond = stabilizePresetRecord(entryA, NO_BOND, { class: 'same' });
		const recBond = stabilizePresetRecord(entryA, bond, { class: 'same' });
		expect(recBond).not.toBe(recNoBond);
	});

	it('stabilized records make the downstream variant cache hit (same result reference)', () => {
		const entry = () => {};
		const makeRecord = () => ({
			class: 'base',
			variants: { size: { sm: 'text-sm' } },
			compounds: [],
			defaults: { size: 'sm' }
		});
		const a = stabilizePresetRecord(entry, NO_BOND, makeRecord());
		const b = stabilizePresetRecord(entry, NO_BOND, makeRecord());
		expect(b).toBe(a);
		// Same def reference → resolveVariants returns the same cached object.
		expect(resolveVariants(a as never, null, {})).toBe(resolveVariants(b as never, null, {}));
	});
});

describe('resolveVariants — explicit-undefined prop semantics (pinned)', () => {
	it('an own prop with value undefined does NOT fall back to the default', () => {
		const def = {
			class: '',
			variants: { size: { sm: 'text-sm', lg: 'text-lg' } },
			compounds: [],
			defaults: { size: 'lg' }
		};
		// `size={undefined}` was passed explicitly → no variant class applies.
		const result = resolveVariants(def, null, { size: undefined });
		expect(result.class).not.toContain('text-lg');
		expect(result.class).not.toContain('text-sm');
	});
});
