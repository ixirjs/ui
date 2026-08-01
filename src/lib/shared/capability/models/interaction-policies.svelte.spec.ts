import { describe, expect, it, vi } from 'vitest';
import { Bond, Atom, bondContextKey, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineCapability } from '$ixirjs/ui/shared/capability/capability';
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

class TestState {
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
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-interaction-policies');
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
		bond.capability(disclosureCapability(state.disclosure));
		bond.capability(cap);
		const trigger = bond.addAtom('trigger', 'trigger');

		expect(cap.slot).toBe(FOCUS_TRIGGER);
		expect(cap.requires).toEqual([expect.any(Symbol)]);
		expect(cap.meta).toMatchObject({ projects: ['trigger'] });

		(trigger.spread.onfocusin as (ev: FocusEvent) => void)(event<FocusEvent>());
		expect(state.open).toBe(true);

		(trigger.spread.onfocusout as (ev: FocusEvent) => void)(event<FocusEvent>());
		expect(state.open).toBe(false);
	});

	it('activationPolicy handles click and keyboard activation like a button', () => {
		const onActivate = vi.fn();
		const bond = new TestBond();
		const cap = activationPolicy({ onActivate });
		bond.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(ACTIVATION_POLICY);
		expect(control.spread.role).toBe('button');
		expect(control.spread.tabindex).toBe(0);

		(control.spread.onclick as (ev: MouseEvent) => void)(
			event<MouseEvent>({ type: 'click', isPrimary: false })
		);
		(control.spread.onkeydown as (ev: KeyboardEvent) => void)(
			event<KeyboardEvent>({ key: 'Enter' })
		);
		(control.spread.onkeydown as (ev: KeyboardEvent) => void)(
			event<KeyboardEvent>({ key: 'Enter', repeat: true })
		);
		(control.spread.onclick as (ev: MouseEvent) => void)(event<MouseEvent>({ button: 1 }));
		expect(onActivate).toHaveBeenCalledTimes(2);
	});

	it('clearPolicy clears known input first, then selection when input is empty', () => {
		const state = new TestState();
		const bond = new TestBond(state);
		bond.capability(defineCapability({ slot: INPUT, surface: state.input }));
		bond.capability(selectionCapability(state.selection));
		const cap = clearPolicy();
		bond.capability(cap);
		const clear = bond.addAtom('clear', 'clear');

		expect(cap.slot).toBe(CLEAR_POLICY);
		expect(cap.meta).toMatchObject({ projects: ['clear'] });

		(clear.spread.onclick as (ev: MouseEvent) => void)(event<MouseEvent>());
		expect(state.text).toBe('');
		expect(state.selected).toEqual(['a']);

		(clear.spread.onclick as (ev: MouseEvent) => void)(event<MouseEvent>());
		expect(state.selected).toEqual([]);
	});

	it('thumbDragPolicy reports pointer drag deltas', () => {
		const onDrag = vi.fn();
		const onEnd = vi.fn();
		const bond = new TestBond();
		const cap = thumbDragPolicy({ axis: 'x', onDrag, onEnd });
		bond.capability(cap);
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

		// A cancelled drag ends the drag: onEnd runs so a caller can release state it staged in
		// onStart, and further moves are ignored. The event is forwarded so a caller that needs to
		// distinguish "completed" from "aborted" can read `event.type`.
		(thumb.spread.onpointercancel as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 1, clientX: 15, clientY: 40 })
		);
		(thumb.spread.onpointermove as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 1, clientX: 20, clientY: 40 })
		);
		expect(onDrag).toHaveBeenCalledTimes(1);
		expect(onEnd).toHaveBeenCalledTimes(1);
	});

	it('projects one thumb drag per role context, so paired thumbs drag independently', () => {
		const onDrag = vi.fn();
		const bond = new TestBond();
		bond.capability(thumbDragPolicy({ onDrag }));
		const thumbX = bond.addAtom('thumbX', 'thumb', 'x');
		const thumbY = bond.addAtom('thumbY', 'thumb', 'y');

		(thumbX.spread.onpointerdown as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 1, clientX: 10, clientY: 10 })
		);
		// Y never received a pointerdown, so its own in-flight drag is empty and it stays quiet.
		(thumbY.spread.onpointermove as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 1, clientX: 30, clientY: 30 })
		);
		expect(onDrag).not.toHaveBeenCalled();

		(thumbX.spread.onpointermove as (ev: PointerEvent) => void)(
			event<PointerEvent>({ pointerId: 1, clientX: 30, clientY: 30 })
		);
		expect(onDrag).toHaveBeenCalledTimes(1);
		expect(onDrag.mock.calls[0]?.[3]).toBe('x');
	});

	it('pointer policies ignore non-primary pointers', () => {
		const onPress = vi.fn();
		const bond = new TestBond();
		bond.capability(trackPressPolicy({ onPress }));
		const track = bond.addAtom('track', 'track');

		(track.spread.onpointerdown as (ev: PointerEvent) => void)(
			event<PointerEvent>({ button: 1, clientX: 60, clientY: 25 })
		);
		(track.spread.onpointerdown as (ev: PointerEvent) => void)(
			event<PointerEvent>({ isPrimary: false, clientX: 60, clientY: 25 })
		);
		expect(onPress).not.toHaveBeenCalled();
	});

	it('trackPressPolicy reports press position as percentages', () => {
		const onPress = vi.fn();
		const bond = new TestBond();
		const cap = trackPressPolicy({ onPress });
		bond.capability(cap);
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
		bond.capability(cap);
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
		bond.capability(cap);
		const a = bond.addAtom('a', 'item', 'a');
		const b = bond.addAtom('b', 'item', 'b');

		expect(cap.slot).toBe(REORDER_DRAG_POLICY);
		expect(a.spread.draggable).toBe(true);
		(a.spread.ondragstart as (ev: DragEvent) => void)(event<DragEvent>());
		(b.spread.ondrop as (ev: DragEvent) => void)(event<DragEvent>());
		expect(onReorder).toHaveBeenCalledWith('a', 'b', bond, expect.any(Object));
	});

	it('reorderDragPolicy rejects external and cross-bond drag sources', () => {
		const onReorder = vi.fn();
		const cap = reorderDragPolicy({ onReorder });
		const sourceBond = new TestBond();
		const targetBond = new TestBond();
		sourceBond.capability(cap);
		targetBond.capability(cap);
		const source = sourceBond.addAtom('source', 'item', 'source');
		const target = targetBond.addAtom('target', 'item', 'target');
		const external = event<DragEvent>({
			dataTransfer: { getData: () => 'untrusted', setData: vi.fn() }
		});

		(source.spread.ondragstart as (ev: DragEvent) => void)(external);
		(target.spread.ondragover as (ev: DragEvent) => void)(external);
		(target.spread.ondrop as (ev: DragEvent) => void)(external);

		expect(external.defaultPrevented).toBe(false);
		expect(onReorder).not.toHaveBeenCalled();
	});

	it('longPressPolicy runs after the configured delay', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const bond = new TestBond();
			const cap = longPressPolicy({ delay: 25, onLongPress });
			bond.capability(cap);
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

	it('longPressPolicy cancels on pointer cancellation', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const bond = new TestBond();
			bond.capability(longPressPolicy({ delay: 25, onLongPress }));
			const control = bond.addAtom('control', 'control');

			(control.spread.onpointerdown as (ev: PointerEvent) => void)(
				event<PointerEvent>({ pointerId: 1 })
			);
			(control.spread.onpointercancel as (ev: PointerEvent) => void)(
				event<PointerEvent>({ pointerId: 2 })
			);
			vi.advanceTimersByTime(25);
			expect(onLongPress).toHaveBeenCalledTimes(1);

			(control.spread.onpointerdown as (ev: PointerEvent) => void)(
				event<PointerEvent>({ pointerId: 1 })
			);
			(control.spread.onpointercancel as (ev: PointerEvent) => void)(
				event<PointerEvent>({ pointerId: 1 })
			);
			vi.advanceTimersByTime(25);
			expect(onLongPress).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('swipePolicy reports allowed swipe directions past the threshold', () => {
		const onSwipe = vi.fn();
		const bond = new TestBond();
		const cap = swipePolicy({ threshold: 20, directions: ['left'], onSwipe });
		bond.capability(cap);
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
