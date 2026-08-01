import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { Collection } from './collection.svelte';

describe('Collection<T>', () => {
	it('starts empty', () => {
		const c = new Collection<string>('test');
		expect(c.size).toBe(0);
		expect(c.values).toEqual([]);
		expect(c.kind).toBe('test');
	});

	it('attach inserts and returns cleanup', () => {
		const c = new Collection<string>('test');
		const cleanup = c.attach('a', 'apple');
		expect(c.size).toBe(1);
		expect(c.get('a')).toBe('apple');
		cleanup();
		expect(c.size).toBe(0);
		expect(c.get('a')).toBeUndefined();
	});

	it('preserves insertion order in values', () => {
		const c = new Collection<string>('test');
		c.attach('b', 'banana');
		c.attach('a', 'apple');
		c.attach('c', 'cherry');
		expect(c.values).toEqual(['banana', 'apple', 'cherry']);
	});

	it('indexOf reflects insertion order, -1 if missing', () => {
		const c = new Collection<string>('test');
		c.attach('b', 'banana');
		c.attach('a', 'apple');
		expect(c.indexOf('b')).toBe(0);
		expect(c.indexOf('a')).toBe(1);
		expect(c.indexOf('missing')).toBe(-1);
	});

	it('has() reports presence', () => {
		const c = new Collection<string>('test');
		c.attach('x', 'x');
		expect(c.has('x')).toBe(true);
		expect(c.has('y')).toBe(false);
	});

	it('cleanup only removes the value it registered (re-mount safety)', () => {
		const c = new Collection<string>('test');
		const cleanup1 = c.attach('a', 'first');
		// Simulate the SAME key being re-attached before cleanup fires (re-mount)
		c.clear(); // clear so the duplicate-id throw doesn't fire
		c.attach('a', 'second');
		cleanup1(); // stale cleanup should not remove 'second'
		expect(c.get('a')).toBe('second');
	});

	it('throws on duplicate id in dev', () => {
		const c = new Collection<string>('test');
		c.attach('a', 'first');
		expect(() => c.attach('a', 'second')).toThrow(/duplicate id 'a'/);
	});

	// Regression: children register from their mount-attachment, i.e. inside an
	// effect. If `attach` read `#items` reactively (the DEV guard / cleanup check)
	// it would depend on the map it then writes and self-invalidate into
	// `effect_update_depth_exceeded`. Registering from an effect must be stable.
	it('attach from inside an effect does not self-invalidate', () => {
		const c = new Collection<string>('test');
		const dispose = $effect.root(() => {
			$effect(() => {
				const cleanup = c.attach('a', 'apple');
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
		c.attach('a', 'a');
		c.attach('b', 'b');
		c.clear();
		expect(c.size).toBe(0);
	});
});
