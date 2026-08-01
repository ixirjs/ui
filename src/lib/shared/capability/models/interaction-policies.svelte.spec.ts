import { describe, expect, it, vi } from 'vitest';
import { Bond, Atom, BondState, bondContextKey, type BondStateProps } from '../../bond';
import {
	activationPolicy,
	ACTIVATION_POLICY,
	clearPolicy,
	CLEAR_POLICY,
	createDisclosure,
	createInput,
	createSelection,
	disclosureCapability,
	focusTrigger,
	FOCUS_TRIGGER,
	INPUT,
	longPressPolicy,
	LONG_PRESS_POLICY,
	reorderDragPolicy,
	REORDER_DRAG_POLICY,
	resizeHandlePolicy,
	RESIZE_HANDLE_POLICY,
	selectionCapability,
	swipePolicy,
	SWIPE_POLICY,
	thumbDragPolicy,
	THUMB_DRAG_POLICY,
	trackPressPolicy,
	TRACK_PRESS_POLICY,
	type DragPolicyDetail,
	type SwipePolicyDetail,
	type TrackPressDetail
} from '.';

class TestState extends BondState<BondStateProps> {
	open = $state(false);
	text = $state('query');
	selected = $state<readonly string[]>(['a']);
	disclosure = createDisclosure({
		get: () => this.open,
		set: (value) => {
			this.open = value;
		}
	});
	input = createInput({
		value: {
			get: () => this.text,
			set: (value) => {
				this.text = value;
			}
		}
	});
	selection = createSelection<string>({
		get: () => this.selected,
		set: (values) => {
			this.selected = values;
		},
		mode: () => 'multiple'
	});

	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-interaction-policies');
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

function event<T extends Event>(overrides: Record<string, unknown> = {}): T {
	const fake: Record<string, unknown> = {
		defaultPrevented: false,
		button: 0,
		preventDefault() {
			fake.defaultPrevented = true;
		},
		...overrides
	};
	return fake as unknown as T;
}

describe('remaining interaction policy primitives', () => {
	it('focusTrigger opens on focus and closes on blur through the disclosure surface', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		const cap = focusTrigger();
		bond.state.capability(disclosureCapability(state.disclosure));
		bond.state.capability(cap);
		const trigger = bond.addAtom('trigger', 'trigger');

		expect(cap.slot).toBe(FOCUS_TRIGGER);
		expect(cap.requires).toEqual([expect.any(Symbol)]);
		expect(cap.meta).toMatchObject({ layer: 1, kind: 'policy', projects: ['trigger'] });

		(trigger.spread.onfocusin as (ev: FocusEvent) => void)(event<FocusEvent>());
		expect(state.open).toBe(true);

		(trigger.spread.onfocusout as (ev: FocusEvent) => void)(event<FocusEvent>());
		expect(state.open).toBe(false);
	});

	it('activationPolicy handles click and keyboard activation like a button', () => {
		const onActivate = vi.fn();
		const bond = new TestBond();
		const cap = activationPolicy({ onActivate });
		bond.state.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(ACTIVATION_POLICY);
		expect(control.spread.role).toBe('button');
		expect(control.spread.tabindex).toBe(0);

		(control.spread.onclick as (ev: MouseEvent) => void)(event<MouseEvent>());
		(control.spread.onkeydown as (ev: KeyboardEvent) => void)(
			event<KeyboardEvent>({ key: 'Enter' })
		);
		expect(onActivate).toHaveBeenCalledTimes(2);
	});

	it('clearPolicy clears known input first, then selection when input is empty', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.state.capability({ slot: INPUT, surface: state.input });
		bond.state.capability(selectionCapability(state.selection));
		const cap = clearPolicy();
		bond.state.capability(cap);
		const clear = bond.addAtom('clear', 'clear');

		expect(cap.slot).toBe(CLEAR_POLICY);
		expect(cap.meta).toMatchObject({ layer: 1, kind: 'policy', projects: ['clear'] });

		(clear.spread.onclick as (ev: MouseEvent) => void)(event<MouseEvent>());
		expect(state.text).toBe('');
		expect(state.selected).toEqual(['a']);

		(clear.spread.onclick as (ev: MouseEvent) => void)(event<MouseEvent>());
		expect(state.selected).toEqual([]);
	});

	it('thumbDragPolicy reports pointer drag deltas', () => {
		const onDrag = vi.fn();
		const bond = new TestBond();
		const cap = thumbDragPolicy({ axis: 'x', onDrag });
		bond.state.capability(cap);
		const thumb = bond.addAtom('thumb', 'thumb');

		expect(cap.slot).toBe(THUMB_DRAG_POLICY);
		(thumb.spread.onpointerdown as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 1, clientX: 10, clientY: 20 })
		);
		(thumb.spread.onpointermove as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 1, clientX: 15, clientY: 40 })
		);

		const detail = onDrag.mock.calls[0]?.[0] as DragPolicyDetail;
		expect(detail.deltaX).toBe(5);
		expect(detail.deltaY).toBe(0);
	});

	it('trackPressPolicy reports press position as percentages', () => {
		const onPress = vi.fn();
		const bond = new TestBond();
		const cap = trackPressPolicy({ onPress });
		bond.state.capability(cap);
		const track = bond.addAtom('track', 'track');

		expect(cap.slot).toBe(TRACK_PRESS_POLICY);
		(track.spread.onpointerdown as (ev: PointerEvent) => void)(
			event<PointerEvent>({
				clientX: 60,
				clientY: 25,
				currentTarget: {
					getBoundingClientRect: () => ({ left: 10, top: 5, width: 100, height: 40 })
				}
			})
		);

		const detail = onPress.mock.calls[0]?.[0] as TrackPressDetail;
		expect(detail.percentX).toBe(50);
		expect(detail.percentY).toBe(50);
	});

	it('resizeHandlePolicy reports resize deltas', () => {
		const onResize = vi.fn();
		const bond = new TestBond();
		const cap = resizeHandlePolicy({ onResize });
		bond.state.capability(cap);
		const handle = bond.addAtom('handle', 'handle');

		expect(cap.slot).toBe(RESIZE_HANDLE_POLICY);
		(handle.spread.onpointerdown as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 2, clientX: 30, clientY: 40 })
		);
		(handle.spread.onpointermove as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 2, clientX: 45, clientY: 55 })
		);

		const detail = onResize.mock.calls[0]?.[0] as DragPolicyDetail;
		expect(detail.deltaX).toBe(15);
		expect(detail.deltaY).toBe(15);
	});

	it('reorderDragPolicy calls onReorder from source item to drop target', () => {
		const onReorder = vi.fn();
		const bond = new TestBond();
		const cap = reorderDragPolicy({ onReorder });
		bond.state.capability(cap);
		const a = bond.addAtom('a', 'item', 'a');
		const b = bond.addAtom('b', 'item', 'b');

		expect(cap.slot).toBe(REORDER_DRAG_POLICY);
		expect(a.spread.draggable).toBe(true);
		(a.spread.ondragstart as (ev: DragEvent) => void)(event<DragEvent>());
		(b.spread.ondrop as (ev: DragEvent) => void)(event<DragEvent>());
		expect(onReorder).toHaveBeenCalledWith('a', 'b', bond, expect.any(Object));
	});

	it('longPressPolicy runs after the configured delay', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const bond = new TestBond();
			const cap = longPressPolicy({ delay: 25, onLongPress });
			bond.state.capability(cap);
			const control = bond.addAtom('control', 'control');

			expect(cap.slot).toBe(LONG_PRESS_POLICY);
			(control.spread.onpointerdown as (ev: PointerEvent) => void)(event<PointerEvent>());
			vi.advanceTimersByTime(24);
			expect(onLongPress).not.toHaveBeenCalled();
			vi.advanceTimersByTime(1);
			expect(onLongPress).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('swipePolicy reports allowed swipe directions past the threshold', () => {
		const onSwipe = vi.fn();
		const bond = new TestBond();
		const cap = swipePolicy({ threshold: 20, directions: ['left'], onSwipe });
		bond.state.capability(cap);
		const surface = bond.addAtom('surface', 'surface');

		expect(cap.slot).toBe(SWIPE_POLICY);
		(surface.spread.onpointerdown as (ev: PointerEvent) => void)(
			event<PointerEvent>({ clientX: 50, clientY: 10 })
		);
		(surface.spread.onpointerup as (ev: PointerEvent) => void)(
			event<PointerEvent>({ clientX: 10, clientY: 15 })
		);

		const detail = onSwipe.mock.calls[0]?.[0] as SwipePolicyDetail;
		expect(detail.direction).toBe('left');
		expect(detail.deltaX).toBe(-40);
	});
});
