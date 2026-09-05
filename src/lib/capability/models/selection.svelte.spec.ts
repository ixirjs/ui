import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { createSelection, type SelectionBacking } from './selection.svelte';

// Reactive backing store standing in for a bond's bindable props.
// `values` is the array store; `mode` flips single/multiple.
function makeBacking<T>(initial: T[] = [], mode: 'single' | 'multiple' = 'multiple') {
	let values = $state<T[]>(initial);
	let m = $state(mode);
	const backing: SelectionBacking<T> = {
		get: () => values,
		set: (v) => (values = v),
		mode: () => m
	};
	return {
		backing,
		read: () => values,
		setMode: (next: 'single' | 'multiple') => (m = next)
	};
}

// Single-value adapter: a scalar `value` presented as the array backing (tabs).
function makeScalarBacking(initial?: string) {
	let value = $state<string | undefined>(initial);
	const backing: SelectionBacking<string> = {
		get: () => (value ? [value] : []),
		set: (vs) => (value = vs[0]),
		mode: () => 'single'
	};
	return { backing, read: () => value };
}

describe('SelectionModel<T> — multiple mode (accordion / select / datagrid)', () => {
	it('select unions into the committed set, no duplicates', () => {
		const { backing, read } = makeBacking<string>([]);
		const sel = createSelection(backing);
		sel.select('a');
		sel.select('b');
		sel.select('a'); // duplicate ignored
		expect(read()).toEqual(['a', 'b']);
		expect(sel.values).toEqual(['a', 'b']);
	});

	it('select accepts a batch (select(ids[]))', () => {
		const { backing, read } = makeBacking<string>(['a']);
		createSelection(backing).select(['b', 'c', 'a']);
		expect(read()).toEqual(['a', 'b', 'c']);
	});

	it('preserves Set membership semantics for signed zero', () => {
		const { backing, read } = makeBacking<number>([]);
		const selection = createSelection(backing);
		selection.select(0);
		selection.select(-0);
		expect(read()).toHaveLength(1);
		expect(selection.isSelected(-0)).toBe(true);
	});

	it('supports array-valued items when the backing supplies a discriminator', () => {
		const { backing, read } = makeBacking<string[]>([]);
		backing.isValue = Array.isArray;
		backing.equals = (left, right) =>
			left.length === right.length && left.every((item, index) => item === right[index]);
		const selection = createSelection(backing);
		const value = ['a', 'b'];

		selection.select(value);
		expect(read()).toEqual([value]);
		selection.deselect(value);
		expect(read()).toEqual([]);
	});

	it('deselect removes one or many', () => {
		const { backing, read } = makeBacking<string>(['a', 'b', 'c']);
		const sel = createSelection(backing);
		sel.deselect('b');
		expect(read()).toEqual(['a', 'c']);
		sel.deselect(['a', 'c']);
		expect(read()).toEqual([]);
	});

	it('toggle adds when absent, removes when present', () => {
		const { backing, read } = makeBacking<string>([]);
		const sel = createSelection(backing);
		sel.toggle('x');
		expect(read()).toEqual(['x']);
		sel.toggle('x');
		expect(read()).toEqual([]);
	});

	it('isSelected and clear', () => {
		const { backing } = makeBacking<string>(['a', 'b']);
		const sel = createSelection(backing);
		expect(sel.isSelected('a')).toBe(true);
		expect(sel.isSelected('z')).toBe(false);
		sel.clear();
		expect(sel.values).toEqual([]);
	});
});

describe('SelectionModel<T> — single mode (tabs / collapsible)', () => {
	it('select replaces the committed value (first incoming wins)', () => {
		const { backing, read } = makeBacking<string>([], 'single');
		const sel = createSelection(backing);
		sel.select('a');
		expect(read()).toEqual(['a']);
		sel.select('b');
		expect(read()).toEqual(['b']);
		sel.select(['c', 'd']); // batch into single → first wins
		expect(read()).toEqual(['c']);
	});

	it('toggle off clears (collapsible semantics)', () => {
		const { backing, read } = makeBacking<string>(['a'], 'single');
		const sel = createSelection(backing);
		sel.toggle('a');
		expect(read()).toEqual([]);
		sel.toggle('b');
		expect(read()).toEqual(['b']);
	});

	it('adapts a scalar backing (tabs value ↔ [value])', () => {
		const { backing, read } = makeScalarBacking();
		const sel = createSelection(backing);
		sel.select('tab-1');
		expect(read()).toBe('tab-1');
		expect(sel.values).toEqual(['tab-1']);
		sel.select('tab-2');
		expect(read()).toBe('tab-2');
		sel.clear();
		expect(read()).toBeUndefined();
	});
});

describe('SelectionModel<T> — mode is read live from the backing', () => {
	it('respects a runtime mode flip (multiple → single)', () => {
		const { backing, read, setMode } = makeBacking<string>(['a', 'b'], 'multiple');
		const sel = createSelection(backing);
		expect(sel.mode).toBe('multiple');
		setMode('single');
		expect(sel.mode).toBe('single');
		sel.select('c'); // now single → replaces
		expect(read()).toEqual(['c']);
	});
});

describe('SelectionModel<T> — reactivity', () => {
	it('values is reactive: a $derived recomputes when selection changes', () => {
		const { backing } = makeBacking<string>([]);
		const sel = createSelection(backing);
		let count = 0; // plain (not $state) so the effect doesn't read+write the same cell
		const dispose = $effect.root(() => {
			$effect(() => {
				void sel.values.length;
				count++;
			});
		});
		flushSync();
		const initial = count;
		sel.select('a');
		flushSync();
		expect(count).toBeGreaterThan(initial);
		dispose();
	});

	it('selectedness tracks in-place mutations to a reactive backing array', () => {
		const { backing, read } = makeBacking<string>([]);
		const sel = createSelection(backing);
		let selected = false;
		const dispose = $effect.root(() => {
			$effect(() => {
				selected = sel.isSelected('b');
			});
		});
		flushSync();

		read().push('b');
		flushSync();
		expect(selected).toBe(true);
		dispose();
	});
});

describe('SelectionModel<T> — iterable protocol (#4)', () => {
	it('iterates committed values in storage order; spreads and destructures', () => {
		const { backing } = makeBacking<string>(['a', 'b']);
		const sel = createSelection(backing);
		expect([...sel]).toEqual(['a', 'b']);

		const out: string[] = [];
		for (const v of sel) out.push(v);
		expect(out).toEqual(['a', 'b']);
	});

	it('reflects live commits — a fresh iteration sees the updated set', () => {
		const { backing } = makeBacking<string>([]);
		const sel = createSelection(backing);
		expect([...sel]).toEqual([]);
		sel.select('a');
		sel.select('b');
		expect([...sel]).toEqual(['a', 'b']);
	});
});

// The membership index only answers when it still describes the exact array `get()` just returned.
// These pin both halves of that guard: it must be used where it is sound, and skipped where it is
// not — because being wrong here is a stale `aria-selected`, not a slow one.
describe('membership index', () => {
	// Long enough to cross SET_MIN, so the Set is built rather than skipped.
	const many = Array.from({ length: 12 }, (_, i) => `v${i}`);

	it('sees an in-place write to an indexed backing', () => {
		const { backing, read } = makeBacking<string>([...many]);
		const selection = createSelection<string>({ ...backing, indexed: true });
		expect(selection.isSelected('v3')).toBe(true);

		// Identity and length both unchanged — the case a cached Set keyed on the array cannot see.
		read()[3] = 'replaced';
		flushSync();

		expect(selection.isSelected('v3')).toBe(false);
		expect(selection.isSelected('replaced')).toBe(true);
	});

	it('falls back to the scan for a backing that does not declare itself indexed', () => {
		// A plain array behind a plain getter: nothing here ever invalidates a derived, so an index
		// would freeze at its first value. Not declaring `indexed` must keep the scan.
		const values = [...many];
		const selection = createSelection<string>({
			get: () => values,
			set: () => {},
			mode: () => 'multiple'
		});
		expect(selection.isSelected('v3')).toBe(true);

		values[3] = 'replaced';

		expect(selection.isSelected('v3')).toBe(false);
		expect(selection.isSelected('replaced')).toBe(true);
	});

	it('honours a custom equals instead of indexing', () => {
		const { backing } = makeBacking<string>([...many]);
		const selection = createSelection<string>({
			...backing,
			indexed: true,
			equals: (l, r) => l.toLowerCase() === r.toLowerCase()
		});

		// A Set is SameValueZero, so an indexed answer would miss this.
		expect(selection.isSelected('V3')).toBe(true);
	});
});

// Characterization for the bulk fast path: comparisons may change, stored values and writes may not.
describe('bulk backing contracts', () => {
	it('preserves existing duplicates, identity, NaN, signed zero and undefined', () => {
		const object = {};
		let values: unknown[] = [-0, NaN, undefined, object, object];
		const writes: unknown[][] = [];
		const selection = createSelection<unknown>({
			get: () => values,
			set: (next) => {
				values = next;
				writes.push(next);
			},
			mode: () => 'multiple'
		});
		selection.select([0, NaN, object, undefined, 1, 2, 3, 4, 1]);
		expect(values).toEqual([-0, NaN, undefined, object, object, 1, 2, 3, 4]);
		expect(Object.is(values[0], -0)).toBe(true);
		expect(values[3]).toBe(object);
		selection.deselect([object, NaN, 1, 2, 3, 4, 5, 6]);
		expect(values).toEqual([-0, undefined]);
		selection.select([]);
		selection.deselect([]);
		expect(writes).toHaveLength(4);
		expect(writes[2]).not.toBe(writes[3]);
	});

	it('ignores sparse outgoing holes but visits incoming holes', () => {
		let values: Array<number | undefined> = [undefined, 1, 2];
		const selection = createSelection<number | undefined>({
			get: () => values,
			set: (next) => {
				values = next;
			},
			mode: () => 'multiple'
		});
		const holes = new Array<number | undefined>(8);
		holes[7] = 1;
		selection.deselect(holes);
		expect(values).toEqual([undefined, 2]);
		values = [2];
		selection.select(holes);
		expect(values).toEqual([2, undefined, 1]);
	});

	it('retains comparator direction and the comparator captured at construction', () => {
		let values = ['A', 'A'];
		const backing: SelectionBacking<string> = {
			get: () => values,
			set: (next) => {
				values = next;
			},
			mode: () => 'multiple',
			equals: (left, right) => left.toLowerCase() === right
		};
		const selection = createSelection(backing);
		delete backing.equals;
		selection.select(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
		expect(values).toEqual(['A', 'A', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
		selection.deselect(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
		expect(values).toEqual([]);
	});

	it('never caches unindexed backing mutations or assumes the owner accepted a write', () => {
		const values = Array.from({ length: 12 }, (_, i) => i);
		const writes: number[][] = [];
		const selection = createSelection<number>({
			get: () => values,
			set: (next) => {
				writes.push(next);
			},
			mode: () => 'multiple'
		});
		selection.select(Array.from({ length: 12 }, (_, i) => i + 12));
		expect(selection.values).toBe(values);
		expect(selection.isSelected(12)).toBe(false);
		values[0] = 99;
		selection.deselect([99, 1, 2, 3, 4, 5, 6, 7]);
		expect(writes[1]).toEqual([8, 9, 10, 11]);
	});
});
