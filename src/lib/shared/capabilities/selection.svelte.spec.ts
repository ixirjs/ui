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
