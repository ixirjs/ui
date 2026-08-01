import { describe, expect, it, vi } from 'vitest';
import { Bond, Atom, BondState, bondContextKey, type BondStateProps } from '../../bond';
import {
	createDateSelection,
	createGeometry,
	createLoading,
	createPagination,
	createPressed,
	createRangeValue,
	createViewport,
	dateSelectionCapability,
	DATE_SELECTION,
	GEOMETRY,
	geometryCapability,
	loadingCapability,
	LOADING,
	PAGINATION,
	paginationCapability,
	PRESSED,
	pressedCapability,
	RANGE_VALUE,
	rangeValueCapability,
	VIEWPORT,
	viewportCapability,
	type DateSelectionState,
	type GeometryRect
} from '.';

class TestState extends BondState<BondStateProps> {
	pressed = $state(false);
	range = $state(10);
	loading = $state(false);
	error = $state<unknown>();
	page = $state(1);
	pageSize = $state(10);
	total = $state(25);
	viewport = $state({ width: 320, height: 240 });
	scroll = $state({ x: 4, y: 8 });
	date = $state<DateSelectionState>({});

	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-state-model-primitives');
	constructor(state = new TestState()) {
		super(state, 'test');
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
	it('pressedCapability exposes toggle-button pressed state', () => {
		const state = new TestState();
		const pressed = createPressed({
			get: () => state.pressed,
			set: (value) => {
				state.pressed = value;
			}
		});
		const cap = pressedCapability(pressed);
		const bond = new TestBond(state);
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(PRESSED);
		expect(cap.meta).toMatchObject({ layer: 1, kind: 'model', projects: ['control'] });
		expect(control.spread['aria-pressed']).toBe('false');

		(control.spread.onclick as () => void)();
		expect(state.pressed).toBe(true);
		expect(control.spread['aria-pressed']).toBe('true');
		expect(control.spread['data-pressed']).toBe('');
	});

	it('rangeValueCapability exposes bounded values and slider attrs', () => {
		const state = new TestState();
		const range = createRangeValue({
			value: () => state.range,
			set: (value) => {
				state.range = value;
			},
			min: () => 0,
			max: () => 20,
			step: () => 5
		});
		const cap = rangeValueCapability(range);
		const bond = new TestBond(state);
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(RANGE_VALUE);
		expect(range.percent).toBe(50);
		expect(control.spread.role).toBe('slider');
		expect(control.spread['aria-valuenow']).toBe(10);
		expect(control.spread['data-percent']).toBe(50);

		(control.spread.onkeydown as (event: KeyboardEvent) => void)(
			new KeyboardEvent('keydown', { key: 'ArrowRight' })
		);
		expect(state.range).toBe(15);
	});

	it('loadingCapability exposes pending, settled, stale, and error state', () => {
		const state = new TestState();
		const loading = createLoading({
			pending: () => state.loading,
			error: () => state.error,
			stale: () => true
		});
		const cap = loadingCapability(loading);
		const bond = new TestBond(state);
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(LOADING);
		expect(control.spread['aria-busy']).toBe('false');
		expect(control.spread['data-settled']).toBe('');
		expect(control.spread['data-stale']).toBe('');

		state.loading = true;
		state.error = new Error('Nope');
		expect(control.spread['aria-busy']).toBe('true');
		expect(control.spread['data-loading']).toBe('');
		expect(control.spread['data-error']).toBe('');
	});

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
		bond.state.capability(cap);
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
	});

	it('viewportCapability exposes size, scroll, and visible range', () => {
		const state = new TestState();
		const viewport = createViewport({
			size: () => state.viewport,
			scroll: () => state.scroll,
			visibleRange: () => ({ start: 2, end: 8 })
		});
		const cap = viewportCapability(viewport);
		const bond = new TestBond(state);
		bond.state.capability(cap);
		const container = bond.addAtom('container', 'container');

		expect(cap.slot).toBe(VIEWPORT);
		expect(container.spread['data-viewport-width']).toBe(320);
		expect(container.spread['data-scroll-y']).toBe(8);
		expect(container.spread['data-visible-start']).toBe(2);
	});

	it('geometryCapability stores and projects named rects', () => {
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
		const cap = geometryCapability(geometry);
		const bond = new TestBond();
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control', 'thumb');

		expect(cap.slot).toBe(GEOMETRY);
		expect(control.spread['data-rect-width']).toBeUndefined();

		geometry.setRect('thumb', rect);
		expect(geometry.keys()).toEqual(['thumb']);
		expect(control.spread['data-rect-width']).toBe(30);
		expect(control.spread['data-rect-bottom']).toBe(42);
	});

	it('dateSelectionCapability exposes single date, range, and visible month state', () => {
		const state = new TestState();
		const set = vi.fn((next: DateSelectionState) => {
			state.date = next;
		});
		const selection = createDateSelection({
			get: () => state.date,
			set
		});
		const cap = dateSelectionCapability(selection);
		const bond = new TestBond(state);
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(DATE_SELECTION);
		selection.select(new Date('2026-06-26T00:00:00.000Z'));
		expect(control.spread['data-date']).toBe('2026-06-26');

		selection.selectRange(
			new Date('2026-06-01T00:00:00.000Z'),
			new Date('2026-06-30T00:00:00.000Z')
		);
		selection.setVisibleMonth(new Date('2026-06-01T00:00:00.000Z'));
		expect(control.spread['data-range']).toBe('');
		expect(control.spread['data-range-start']).toBe('2026-06-01');
		expect(control.spread['data-visible-month']).toBe('2026-06');
		expect(set).toHaveBeenCalled();
	});
});
