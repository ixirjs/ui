import { describe, expect, it } from 'vitest';
import { createGeometry, createPagination, type GeometryRect } from '.';

class TestState {
	page = $state(1);
	pageSize = $state(10);
	total = $state(25);
}

describe('remaining Layer 1 state/model primitives', () => {
	it('createPagination derives boundaries and moves between pages', () => {
		const state = new TestState();
		const pagination = createPagination({
			page: () => state.page,
			pageSize: () => state.pageSize,
			total: () => state.total,
			setPage: (page) => {
				state.page = page;
			}
		});

		expect(pagination.pageCount).toBe(3);
		expect(pagination.page).toBe(1);
		expect(pagination.startIndex).toBe(0);
		expect(pagination.endIndex).toBe(10); // exclusive end
		expect(pagination.hasPrevious).toBe(false);
		expect(pagination.hasNext).toBe(true);

		pagination.nextPage();
		expect(state.page).toBe(2);
		expect(pagination.hasPrevious).toBe(true);

		pagination.previousPage();
		expect(state.page).toBe(1);
	});

	it('createPagination coerces a nonsensical backing into a usable range', () => {
		const state = new TestState();
		const pagination = createPagination({
			page: () => state.page,
			pageSize: () => state.pageSize,
			total: () => state.total
		});

		state.total = -1;
		state.page = Number.NaN;
		state.pageSize = Number.POSITIVE_INFINITY;
		expect(pagination.total).toBe(0);
		expect(pagination.page).toBe(1);
		expect(pagination.pageSize).toBe(1);
		expect(pagination.startIndex).toBe(0);
		expect(pagination.endIndex).toBe(0);
	});

	// The geometry model is a named-rect store a family writes measurements into. It has no
	// ARIA/data projection of its own — that was removed as unused.
	it('createGeometry stores, reads back, and clears named rects', () => {
		const rect: GeometryRect = {
			x: 1,
			y: 2,
			width: 30,
			height: 40,
			top: 2,
			right: 31,
			bottom: 42,
			left: 1
		};
		const geometry = createGeometry();

		expect(geometry.rect('thumb')).toBeUndefined();
		expect(geometry.keys()).toEqual([]);

		geometry.setRect('thumb', rect);
		expect(geometry.keys()).toEqual(['thumb']);
		expect(geometry.rect('thumb')).toEqual(rect);

		geometry.clear('thumb');
		expect(geometry.rect('thumb')).toBeUndefined();
		expect(geometry.keys()).toEqual([]);
	});
});
