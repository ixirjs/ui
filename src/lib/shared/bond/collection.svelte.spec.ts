import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { Collection } from './collection.svelte';
import { BondState, type BondStateProps } from './index';

class CollectionOwnerState extends BondState<BondStateProps> {
	#values = $derived(this.items.values);

	constructor() {
		super({});
		void this.items;
	}

	get items(): Collection<string> {
		return this.collection<string>('item');
	}

	get values(): readonly string[] {
		return this.#values;
	}
}

describe('Collection<T>', () => {
	it('starts empty', () => {
		const c = new Collection<string>('test');
		expect(c.size).toBe(0);
		expect(c.values).toEqual([]);
		expect(c.kind).toBe('test');
	});

	it('set inserts and returns cleanup', () => {
		const c = new Collection<string>('test');
		const cleanup = c.set('a', 'apple');
		expect(c.size).toBe(1);
		expect(c.get('a')).toBe('apple');
		cleanup();
		expect(c.size).toBe(0);
		expect(c.get('a')).toBeUndefined();
	});

	it('preserves insertion order in values', () => {
		const c = new Collection<string>('test');
		c.set('b', 'banana');
		c.set('a', 'apple');
		c.set('c', 'cherry');
		expect(c.values).toEqual(['banana', 'apple', 'cherry']);
	});

	it('indexOf reflects insertion order, -1 if missing', () => {
		const c = new Collection<string>('test');
		c.set('b', 'banana');
		c.set('a', 'apple');
		expect(c.indexOf('b')).toBe(0);
		expect(c.indexOf('a')).toBe(1);
		expect(c.indexOf('missing')).toBe(-1);
	});

	it('indexOf updates after deletions and insertions', () => {
		const c = new Collection<string>('test');
		c.set('a', 'apple');
		const cleanupB = c.set('b', 'banana');
		c.set('c', 'cherry');
		expect(c.indexOf('c')).toBe(2);

		cleanupB();
		expect(c.indexOf('c')).toBe(1);

		c.set('d', 'date');
		expect(c.indexOf('d')).toBe(2);
	});

	it('has() reports presence', () => {
		const c = new Collection<string>('test');
		c.set('x', 'x');
		expect(c.has('x')).toBe(true);
		expect(c.has('y')).toBe(false);
	});

	it('cleanup only removes the value it registered (re-mount safety)', () => {
		const c = new Collection<string>('test');
		const cleanup1 = c.set('a', 'first');
		// Simulate the SAME key being set again before cleanup fires (re-mount)
		c.clear(); // clear so the duplicate-id throw doesn't fire
		c.set('a', 'second');
		cleanup1(); // stale cleanup should not remove 'second'
		expect(c.get('a')).toBe('second');
	});

	it('throws on duplicate id in dev', () => {
		const c = new Collection<string>('test');
		c.set('a', 'first');
		expect(() => c.set('a', 'second')).toThrow(/duplicate id 'a'/);
	});

	// Regression: set runs inside the child's mount effect; a reactive read of `#items`
	// (DEV guard / cleanup check) would depend on the map it writes → effect_update_depth_exceeded.
	it('set from inside an effect does not self-invalidate', () => {
		const c = new Collection<string>('test');
		const dispose = $effect.root(() => {
			$effect(() => {
				const cleanup = c.set('a', 'apple');
				return cleanup;
			});
		});
		expect(() => flushSync()).not.toThrow();
		expect(c.get('a')).toBe('apple');
		dispose();
		expect(c.get('a')).toBeUndefined();
	});

	it('clear() empties the collection', () => {
		const c = new Collection<string>('test');
		c.set('a', 'a');
		c.set('b', 'b');
		c.clear();
		expect(c.size).toBe(0);
	});

	it('keeps derived views reactive when a BondState eagerly owns the collection', () => {
		const state = new CollectionOwnerState();

		expect(state.values).toEqual([]);

		state.items.set('a', 'alpha');

		expect(state.values).toEqual(['alpha']);
	});
});
