import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import {
	createRovingFocus,
	rovingCapability,
	type RovingBacking
} from './roving-focus.svelte';
import { Bond, BondState, BondAtom, bondContextKey, type BondStateProps } from '../bond.svelte';

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

describe('rovingCapability — aria-activedescendant projection onto the container', () => {
	class TState extends BondState<BondStateProps> {
		ids = $state<string[]>(['a', 'b', 'c']);
		roving = createRovingFocus({ ids: () => this.ids });
		constructor() {
			super({});
		}
	}
	class TBond extends Bond<BondStateProps, TState> {
		static CONTEXT_KEY = bondContextKey('test-roving');
		constructor(state: TState) {
			super(state, 'test');
		}
	}
	class TAtom extends BondAtom<TBond> {
		constructor(bond: TBond, key: string) {
			super(bond, key);
		}
	}

	it('container reflects the active item id (mapped to a DOM id)', () => {
		const bond = new TBond(new TState());
		bond.capability(rovingCapability(bond.state.roving, { itemDomId: (id) => `item-${id}`, orientation: 'vertical' }));
		const container = new TAtom(bond, 'list').role('container');

		expect(container.spread['aria-activedescendant']).toBeUndefined(); // nothing active
		expect(container.spread['aria-orientation']).toBe('vertical');

		bond.state.roving.next(); // → 'a'
		expect(container.spread['aria-activedescendant']).toBe('item-a');
		bond.state.roving.next(); // → 'b'
		expect(container.spread['aria-activedescendant']).toBe('item-b');
	});

	it('defaults itemDomId to identity', () => {
		const bond = new TBond(new TState());
		bond.capability(rovingCapability(bond.state.roving));
		const container = new TAtom(bond, 'list').role('container');
		bond.state.roving.goto('c');
		expect(container.spread['aria-activedescendant']).toBe('c');
	});

	it('item reflects whether it is the highlighted one (boolean data-highlighted)', () => {
		const bond = new TBond(new TState());
		bond.capability(rovingCapability(bond.state.roving));
		const itemB = new TAtom(bond, 'b').role('item', 'b');

		expect(itemB.spread['data-highlighted']).toBe(false); // nothing active
		bond.state.roving.goto('a');
		expect(itemB.spread['data-highlighted']).toBe(false); // a active, not b
		bond.state.roving.goto('b');
		expect(itemB.spread['data-highlighted']).toBe(true); // b active → highlighted
	});
});

describe('RovingFocus — reactive over the injected list', () => {
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
});
