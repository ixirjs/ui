import { describe, expect, it } from 'vitest';
import { createSort, type SortState } from './sort.svelte';

class SortState_ {
	sort = $state<SortState>({});
}

function sortFixture() {
	const state = new SortState_();
	const sort = createSort({
		get: () => state.sort,
		set: (next) => {
			state.sort = next;
		}
	});
	return { state, sort };
}

describe('createSort', () => {
	it('toggle cycles one field asc → desc → unsorted', () => {
		const { state, sort } = sortFixture();

		sort.toggle('name');
		expect(sort.field).toBe('name');
		expect(sort.direction).toBe('asc');
		expect(sort.directionFor('name')).toBe('asc');
		expect(sort.isSorted('name')).toBe(true);

		sort.toggle('name');
		expect(sort.direction).toBe('desc');
		expect(sort.directionFor('name')).toBe('desc');

		sort.toggle('name');
		expect(sort.direction).toBeUndefined();
		expect(state.sort).toEqual({});
	});

	it('a second field replaces the first', () => {
		const { sort } = sortFixture();

		sort.toggle('name');
		sort.toggle('age');
		expect(sort.field).toBe('age');
		expect(sort.directionFor('name')).toBeUndefined();
		expect(sort.isSorted('name')).toBe(false);
	});

	it('clear resets the backing state', () => {
		const { state, sort } = sortFixture();

		sort.toggle('age');
		expect(sort.isSorted('age')).toBe(true);
		sort.clear();
		expect(state.sort).toEqual({});
		expect(sort.field).toBeUndefined();
	});
});
