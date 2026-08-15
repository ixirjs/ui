import { describe, expect, it } from 'vitest';
import { collectionCapability, collectionSlot } from './collection.svelte';
import { Collection } from '$ixirjs/ui/shared/bond/collection.svelte';
import { Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';

class TestBond extends Bond<BondStateProps> {}

describe('collectionCapability — identity & surface', () => {
	it('slots at `collection:<kind>` and surfaces the Collection', () => {
		const cap = collectionCapability<string>('item');
		expect(cap.slot).toBe(collectionSlot('item'));
		expect(cap.slot.description).toBe('@ixirjs/cap:collection:item');
		expect(cap.surface).toBeInstanceOf(Collection);
		expect(cap.surface.kind).toBe('item');
	});

	it('is surface-only by default (no behavior — emits nothing on the seam)', () => {
		const cap = collectionCapability('item');
		expect(cap.behavior).toBeUndefined();
	});
});

describe('Bond.collection — registry unification', () => {
	it('registers the collection as a capability at `collection:<kind>`', () => {
		const state = new TestBond({});
		const items = state.collection('item');
		expect(items).toBeInstanceOf(Collection);
		// Same instance is reachable through the capability seam — one registry.
		expect(state.capability(collectionSlot('item'))?.surface).toBe(items);
	});

	it('caches per kind (same instance on repeat access) and namespaces by kind', () => {
		const state = new TestBond({});
		expect(state.collection('item')).toBe(state.collection('item'));
		expect(state.collection('row')).not.toBe(state.collection('item'));
		expect(state.collection('row').kind).toBe('row');
	});

	it('the collection is live: set/cleanup flows through the capability surface', () => {
		const state = new TestBond({});
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
