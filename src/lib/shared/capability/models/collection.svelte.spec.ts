import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { collectionCapability, collectionSlot } from './collection.svelte';
import { Collection } from '../../bond/collection.svelte';
import { BondState, type BondStateProps } from '../../bond';

class TestState extends BondState<BondStateProps> {}

describe('collectionCapability — identity & surface', () => {
	it('slots at `collection:<kind>` and surfaces the Collection', () => {
		const cap = collectionCapability<string>('item');
		expect(cap.slot).toBe(collectionSlot('item'));
		expect(cap.slot.description).toBe('@svelte-atoms/cap:collection:item');
		expect(cap.surface).toBeInstanceOf(Collection);
		expect(cap.surface.kind).toBe('item');
		expect(cap.meta).toMatchObject({ layer: 1, kind: 'model' });
	});

	it('is surface-only by default (no behavior — emits nothing on the seam)', () => {
		const cap = collectionCapability('item');
		expect(cap.behavior).toBeUndefined();
	});
});

describe('BondState.collection — registry unification', () => {
	it('registers the collection as a capability at `collection:<kind>`', () => {
		const state = new TestState({});
		const items = state.collection('item');
		expect(items).toBeInstanceOf(Collection);
		// Same instance is reachable through the capability seam — one registry.
		expect(state.capability(collectionSlot('item'))?.surface).toBe(items);
	});

	it('caches per kind (same instance on repeat access) and namespaces by kind', () => {
		const state = new TestState({});
		expect(state.collection('item')).toBe(state.collection('item'));
		expect(state.collection('row')).not.toBe(state.collection('item'));
		expect(state.collection('row').kind).toBe('row');
	});

	it('the collection is live: set/cleanup flows through the capability surface', () => {
		const state = new TestState({});
		const items = state.collection<{ id: string }>('item');
		const a = { id: 'a' };
		const cleanup = items.set('a', a);
		expect(state.collection<{ id: string }>('item').get('a')).toBe(a);
		cleanup();
		expect(state.collection<{ id: string }>('item').has('a')).toBe(false);
	});
});

describe('Collection — iterable protocol (#4)', () => {
	it('iterates [id, value] entries in insertion order; spreads and destructures', () => {
		const col = new Collection<{ id: string }>('item');
		const a = { id: 'a' };
		const b = { id: 'b' };
		col.set('a', a);
		col.set('b', b);

		expect([...col]).toEqual([
			['a', a],
			['b', b]
		]);

		const out: string[] = [];
		for (const [id, value] of col) out.push(`${id}:${value.id}`);
		expect(out).toEqual(['a:a', 'b:b']);
	});
});

describe('collectionCapability — positional ARIA (opt-in)', () => {
	it('projects 1-based posinset + setsize + 0-based data-index on role "item"', () => {
		const cap = collectionCapability<{ id: string }>('item', { positional: true });
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'projection',
			projects: ['item', 'container']
		});
		const col = cap.surface;
		col.set('a', { id: 'a' });
		col.set('b', { id: 'b' });
		col.set('c', { id: 'c' });

		const itemB = cap.behavior!('item', 'b');
		flushSync();
		expect(itemB?.attrs?.({} as never)).toEqual({
			'aria-posinset': 2,
			'aria-setsize': 3,
			'data-index': 1
		});
	});

	it('omits positional attrs for an unregistered id', () => {
		const cap = collectionCapability('item', { positional: true });
		cap.surface.set('a', {});
		const ghost = cap.behavior!('item', 'missing');
		expect(ghost?.attrs?.({} as never)).toEqual({
			'aria-posinset': undefined,
			'aria-setsize': 1,
			'data-index': undefined
		});
	});

	it('projects setsize on role "container" and nothing on unknown roles', () => {
		const cap = collectionCapability('item', { positional: true });
		cap.surface.set('a', {});
		cap.surface.set('b', {});
		expect(cap.behavior!('container')?.attrs?.({} as never)).toEqual({ 'aria-setsize': 2 });
		expect(cap.behavior!('whatever')).toBeUndefined();
	});
});
