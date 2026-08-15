import { describe, expect, it } from 'vitest';
import { Bond, Atom, bondContextKey, type BondStateProps } from '$ixirjs/ui/shared/bond';
import {
	createGeometry,
	createPagination,
	PAGINATION,
	paginationCapability,
	type GeometryRect
} from '.';

class TestState {
	page = $state(1);
	pageSize = $state(10);
	total = $state(25);
	scroll = $state({ x: 4, y: 8 });
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-state-model-primitives');
	constructor(readonly state = new TestState()) {
		super({}, 'test');
	}
	addAtom(key: string, role: string, ctx?: unknown) {
		const atom = new TestAtom(this, key).role(role, ctx);
		this.register(atom, { key });
		return atom;
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key: string) {
		super(bond, key);
	}
}

describe('remaining Layer 1 state/model primitives', () => {
	it('paginationCapability exposes boundaries and previous/next controls', () => {
		const state = new TestState();
		const pagination = createPagination({
			page: () => state.page,
			pageSize: () => state.pageSize,
			total: () => state.total,
			setPage: (page) => {
				state.page = page;
			}
		});
		const cap = paginationCapability(pagination);
		const bond = new TestBond(state);
		bond.capability(cap);
		const container = bond.addAtom('container', 'container');
		const previous = bond.addAtom('previous', 'previous');
		const next = bond.addAtom('next', 'next');

		expect(cap.slot).toBe(PAGINATION);
		expect(pagination.pageCount).toBe(3);
		expect(container.spread['data-page']).toBe(1);
		expect(previous.spread['aria-disabled']).toBe('true');

		(next.spread.onclick as () => void)();
		expect(state.page).toBe(2);
		expect(previous.spread['aria-disabled']).toBeUndefined();

		state.total = -1;
		state.page = Number.NaN;
		state.pageSize = Number.POSITIVE_INFINITY;
		expect(pagination.total).toBe(0);
		expect(pagination.page).toBe(1);
		expect(pagination.pageSize).toBe(1);
		expect(pagination.startIndex).toBe(0);
		expect(pagination.endIndex).toBe(0);
	});

	// The geometry model is the surface `resizeObserverCapability` writes measured rects into.
	// It has no ARIA/data projection of its own — that was removed as unused.
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
