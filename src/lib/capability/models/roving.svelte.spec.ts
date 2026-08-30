import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { createRovingFocus, type RovingBacking } from './roving.svelte';

// Reactive ordered-id list standing in for a bond's Collection.
function makeBacking(initial: string[] = [], wrap = true) {
	let ids = $state<string[]>(initial);
	const backing: RovingBacking = { ids: () => ids, wrap };
	return { backing, setIds: (next: string[]) => (ids = next) };
}

describe('RovingFocus — wrapping navigation (default)', () => {
	it('starts unhighlighted (-1 / null)', () => {
		const r = createRovingFocus(makeBacking(['a', 'b', 'c']).backing);
		expect(r.activeIndex).toBe(-1);
		expect(r.activeId).toBeNull();
	});

	it('next from nothing goes to first, then advances', () => {
		const r = createRovingFocus(makeBacking(['a', 'b', 'c']).backing);
		expect(r.next()).toBe('a');
		expect(r.next()).toBe('b');
		expect(r.next()).toBe('c');
	});

	it('activeItem resolves the active id via the backing.item seam', () => {
		const items: Record<string, { label: string }> = {
			a: { label: 'Apple' },
			b: { label: 'Banana' }
		};
		const r = createRovingFocus<{ label: string }>({
			ids: () => ['a', 'b'],
			item: (id) => items[id]
		});
		expect(r.activeItem).toBeNull(); // nothing active
		r.next();
		expect(r.activeItem).toBe(items.a);
		r.next();
		expect(r.activeItem).toBe(items.b);
		r.clear();
		expect(r.activeItem).toBeNull();
	});

	it('activeItem is null when no item resolver is supplied', () => {
		const r = createRovingFocus(makeBacking(['a', 'b']).backing);
		r.next();
		expect(r.activeId).toBe('a');
		expect(r.activeItem).toBeNull();
	});

	it('next wraps past the end', () => {
		const r = createRovingFocus(makeBacking(['a', 'b']).backing);
		r.next(); // a
		r.next(); // b
		expect(r.next()).toBe('a'); // wrap
		expect(r.activeIndex).toBe(0);
	});

	it('previous from nothing wraps to last', () => {
		const r = createRovingFocus(makeBacking(['a', 'b', 'c']).backing);
		expect(r.previous()).toBe('c');
		expect(r.previous()).toBe('b');
	});

	it('first / last / goto / clear', () => {
		const r = createRovingFocus(makeBacking(['a', 'b', 'c']).backing);
		expect(r.last()).toBe('c');
		expect(r.first()).toBe('a');
		expect(r.goto('b')).toBe('b');
		expect(r.activeIndex).toBe(1);
		expect(r.goto('missing')).toBeNull();
		expect(r.activeIndex).toBe(-1);
		r.last();
		r.clear();
		expect(r.activeIndex).toBe(-1);
	});

	it('handles an empty list gracefully', () => {
		const r = createRovingFocus(makeBacking([]).backing);
		expect(r.next()).toBeNull();
		expect(r.previous()).toBeNull();
		expect(r.first()).toBeNull();
		expect(r.last()).toBeNull();
	});
});

describe('RovingFocus — wrap disabled', () => {
	it('next clamps at the end, previous clamps at the start', () => {
		const r = createRovingFocus(makeBacking(['a', 'b'], false).backing);
		r.next(); // a
		r.next(); // b
		expect(r.next()).toBe('b'); // clamp, no wrap
		r.first();
		expect(r.previous()).toBe('a'); // clamp at start
	});
});

describe('RovingFocus — reactive over the injected list', () => {
	it('preserves the active id when earlier items are removed or reordered', () => {
		const { backing, setIds } = makeBacking(['a', 'b', 'c']);
		const r = createRovingFocus(backing);
		r.goto('b');

		setIds(['b', 'c']);
		expect(r.activeId).toBe('b');
		expect(r.activeIndex).toBe(0);

		setIds(['c', 'b']);
		expect(r.activeId).toBe('b');
		expect(r.activeIndex).toBe(1);
	});

	it('activeId follows the injected ids (Collection-driven)', () => {
		const { backing, setIds } = makeBacking(['a', 'b', 'c']);
		const r = createRovingFocus(backing);
		r.goto('c');
		expect(r.activeId).toBe('c');
		expect(r.activeIndex).toBe(2);
		// list shrinks: index 2 no longer exists → activeId null, reactively
		let seen: string | null = 'unset';
		const dispose = $effect.root(() => {
			$effect(() => {
				seen = r.activeId;
			});
		});
		flushSync();
		expect(seen).toBe('c');
		setIds(['a', 'b']);
		flushSync();
		expect(seen).toBeNull();
		dispose();
	});

	it('preserves active identity across a temporary removal and reinsertion', () => {
		const { backing, setIds } = makeBacking(['a', 'b']);
		const r = createRovingFocus(backing);
		r.goto('b');

		setIds(['a']);
		expect(r.activeId).toBeNull();
		setIds(['a', 'b']);
		expect(r.activeId).toBe('b');
	});

	// The index lookup is memoised against the id list. A `$state` array is mutable in place, so one
	// identity can outlive its contents — the cache must be confirmed, not merely keyed.
	it('reports a fresh index when the id list is mutated in place', () => {
		const ids = $state(['a', 'b', 'c']);
		const r = createRovingFocus({ ids: () => ids });
		r.goto('c');
		expect(r.activeIndex).toBe(2);

		// Same array instance, contents shifted: the answer must move with the item.
		ids.unshift('z');
		expect(r.activeIndex).toBe(3);

		ids.splice(0, 2);
		expect(r.activeIndex).toBe(1);
		expect(r.activeId).toBe('c');

		// Removed entirely: a stale cache would point at whatever now sits at that index.
		ids.splice(ids.indexOf('c'), 1);
		expect(r.activeIndex).toBe(-1);
		expect(r.activeId).toBeNull();
	});
});
