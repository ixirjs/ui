import { definePolicyCapability, sharedCapabilityKey, type Capability } from '../capability';
import type { Bond } from '../../bond';
import { DISCLOSURE } from './disclosure.svelte';
import { INPUT } from './input.svelte';
import { SELECTION, type SelectionModel } from './selection.svelte';

export const FOCUS_TRIGGER = sharedCapabilityKey<void>('@svelte-atoms/cap:focus-trigger');
export const ACTIVATION_POLICY = sharedCapabilityKey<void>('@svelte-atoms/cap:activation-policy');
export const CLEAR_POLICY = sharedCapabilityKey<void>('@svelte-atoms/cap:clear-policy');
export const THUMB_DRAG_POLICY = sharedCapabilityKey<void>('@svelte-atoms/cap:thumb-drag');
export const TRACK_PRESS_POLICY = sharedCapabilityKey<void>('@svelte-atoms/cap:track-press');
export const RESIZE_HANDLE_POLICY = sharedCapabilityKey<void>('@svelte-atoms/cap:resize-handle');
export const REORDER_DRAG_POLICY = sharedCapabilityKey<void>('@svelte-atoms/cap:reorder-drag');
export const LONG_PRESS_POLICY = sharedCapabilityKey<void>('@svelte-atoms/cap:long-press');
export const SWIPE_POLICY = sharedCapabilityKey<void>('@svelte-atoms/cap:swipe');

export type PolicyGuard = boolean | ((bond: Bond, event?: Event) => boolean);
export type PolicyAction<E extends Event = Event> = (bond: Bond, event: E) => void;
export type DragAxis = 'x' | 'y' | 'both';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface ActivationPolicyOptions {
	role?: string;
	onActivate: PolicyAction;
	keys?: readonly string[] | false;
	event?: 'click' | 'pointerdown' | false;
	disabled?: PolicyGuard;
	preventDefaultOnKeys?: boolean;
	buttonAttrs?: boolean;
}

export function activationPolicy(options: ActivationPolicyOptions): Capability<void> {
	const role = options.role ?? 'control';
	const keys = options.keys ?? ['Enter', ' '];
	const eventName = options.event ?? 'click';
	const buttonAttrs = options.buttonAttrs ?? true;

	return definePolicyCapability<void>({
		slot: ACTIVATION_POLICY,
		meta: {
			projects: [role],
			docs: 'Generic button-like click and keyboard activation policy.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						attrs: (bond) => {
							const disabled = isDisabled(options.disabled, bond);
							return {
								...(buttonAttrs ? { role: 'button', tabindex: disabled ? -1 : 0 } : {}),
								'aria-disabled': disabled ? 'true' : undefined,
								'data-disabled': disabled ? '' : undefined
							};
						},
						handlers: (bond) => {
							const handlers: Record<string, unknown> = {};
							if (eventName) {
								handlers[`on${eventName}`] = (event: Event) => {
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									options.onActivate(bond, event);
								};
							}
							if (keys) {
								handlers.onkeydown = (event: KeyboardEvent) => {
									if (!keys.includes(event.key)) return;
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									if (options.preventDefaultOnKeys ?? true) event.preventDefault();
									options.onActivate(bond, event);
								};
							}
							return handlers;
						}
					}
				: undefined
	});
}

export interface FocusTriggerOptions {
	role?: string;
	open?: PolicyAction<FocusEvent>;
	close?: PolicyAction<FocusEvent>;
	closeDelay?: number;
	disabled?: PolicyGuard;
}

export function focusTrigger(options: FocusTriggerOptions = {}): Capability<void> {
	const role = options.role ?? 'trigger';
	const closeDelay = options.closeDelay ?? 0;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	const clearClose = () => {
		if (closeTimer !== undefined) clearTimeout(closeTimer);
		closeTimer = undefined;
	};

	return definePolicyCapability<void>({
		slot: FOCUS_TRIGGER,
		...(options.open || options.close ? {} : { requires: [DISCLOSURE] }),
		meta: {
			projects: [role],
			docs: 'Focus trigger policy that opens on focus and closes or schedules close on blur.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						handlers: (bond) => ({
							onfocusin: (event: FocusEvent) => {
								clearClose();
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								if (options.open) options.open(bond, event);
								else bond.state.requireSurface(DISCLOSURE).open();
							},
							onfocusout: (event: FocusEvent) => {
								clearClose();
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								const close = () => {
									if (options.close) options.close(bond, event);
									else bond.state.requireSurface(DISCLOSURE).close();
								};
								if (closeDelay > 0) closeTimer = setTimeout(close, closeDelay);
								else close();
							}
						}),
						onmount: () => clearClose
					}
				: undefined
	});
}

export interface ClearPolicyOptions {
	role?: string;
	clear?: PolicyAction;
	field?: string;
	keys?: readonly string[] | false;
	event?: 'click' | 'pointerdown' | false;
	disabled?: PolicyGuard;
	buttonAttrs?: boolean;
}

export function clearPolicy(options: ClearPolicyOptions = {}): Capability<void> {
	const role = options.role ?? 'clear';
	const keys = options.keys ?? ['Enter', ' '];
	const eventName = options.event ?? 'click';
	const buttonAttrs = options.buttonAttrs ?? true;
	const clear = (bond: Bond, event: Event) => {
		if (options.clear) {
			options.clear(bond, event);
			return;
		}
		clearKnownSurfaces(bond, options.field);
	};

	return definePolicyCapability<void>({
		slot: CLEAR_POLICY,
		meta: {
			projects: [role],
			docs: 'Generic policy for clearing a value, query, or selection.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						attrs: (bond) => {
							const disabled = isDisabled(options.disabled, bond);
							return {
								...(buttonAttrs ? { role: 'button', tabindex: disabled ? -1 : 0 } : {}),
								'aria-disabled': disabled ? 'true' : undefined,
								'data-disabled': disabled ? '' : undefined
							};
						},
						handlers: (bond) => {
							const handlers: Record<string, unknown> = {};
							if (eventName) {
								handlers[`on${eventName}`] = (event: Event) => {
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									clear(bond, event);
								};
							}
							if (keys) {
								handlers.onkeydown = (event: KeyboardEvent) => {
									if (!keys.includes(event.key)) return;
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									event.preventDefault();
									clear(bond, event);
								};
							}
							return handlers;
						}
					}
				: undefined
	});
}

export interface DragPolicyDetail {
	pointerId: number;
	startX: number;
	startY: number;
	x: number;
	y: number;
	deltaX: number;
	deltaY: number;
}

export interface ThumbDragPolicyOptions {
	role?: string;
	axis?: DragAxis;
	disabled?: PolicyGuard;
	onStart?: (detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void;
	onDrag: (detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void;
	onEnd?: (detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void;
}

export function thumbDragPolicy(options: ThumbDragPolicyOptions): Capability<void> {
	const role = options.role ?? 'thumb';
	return pointerDragPolicy({
		slot: THUMB_DRAG_POLICY,
		role,
		axis: options.axis,
		disabled: options.disabled,
		docs: 'Pointer drag policy for moving a thumb along a track.',
		onStart: options.onStart,
		onMove: options.onDrag,
		onEnd: options.onEnd
	});
}

export interface TrackPressDetail {
	x: number;
	y: number;
	percentX: number;
	percentY: number;
}

export interface TrackPressPolicyOptions {
	role?: string;
	disabled?: PolicyGuard;
	preventDefault?: boolean;
	onPress: (detail: TrackPressDetail, bond: Bond, event: PointerEvent) => void;
}

export function trackPressPolicy(options: TrackPressPolicyOptions): Capability<void> {
	const role = options.role ?? 'track';
	const preventDefault = options.preventDefault ?? true;

	return definePolicyCapability<void>({
		slot: TRACK_PRESS_POLICY,
		meta: {
			projects: [role],
			docs: 'Pointer press policy for moving a value or scroll position from track presses.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						handlers: (bond) => ({
							onpointerdown: (event: PointerEvent) => {
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								if (preventDefault) event.preventDefault();
								options.onPress(trackPressDetail(event), bond, event);
							}
						})
					}
				: undefined
	});
}

export interface ResizeHandlePolicyOptions {
	role?: string;
	axis?: DragAxis;
	disabled?: PolicyGuard;
	onStart?: (detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void;
	onResize: (detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void;
	onEnd?: (detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void;
}

export function resizeHandlePolicy(options: ResizeHandlePolicyOptions): Capability<void> {
	const role = options.role ?? 'handle';
	return pointerDragPolicy({
		slot: RESIZE_HANDLE_POLICY,
		role,
		axis: options.axis,
		disabled: options.disabled,
		docs: 'Pointer drag policy for resizing from a handle.',
		onStart: options.onStart,
		onMove: options.onResize,
		onEnd: options.onEnd
	});
}

export interface ReorderDragPolicyOptions {
	role?: string;
	disabled?: PolicyGuard;
	getId?: (ctx: unknown, bond: Bond) => string | undefined;
	onReorder: (from: string, to: string, bond: Bond, event: DragEvent) => void;
}

export function reorderDragPolicy(options: ReorderDragPolicyOptions): Capability<void> {
	const role = options.role ?? 'item';
	let source: string | undefined;

	return definePolicyCapability<void>({
		slot: REORDER_DRAG_POLICY,
		meta: {
			projects: [role],
			docs: 'Drag/drop reordering policy for item-like roles.'
		},
		behavior: (projectedRole, ctx) =>
			projectedRole === role
				? {
						attrs: () => ({
							draggable: true
						}),
						handlers: (bond) => ({
							ondragstart: (event: DragEvent) => {
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								source = reorderId(options, ctx, bond);
								if (source) event.dataTransfer?.setData('text/plain', source);
							},
							ondragover: (event: DragEvent) => {
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								event.preventDefault();
							},
							ondrop: (event: DragEvent) => {
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								event.preventDefault();
								const from = source ?? event.dataTransfer?.getData('text/plain');
								const to = reorderId(options, ctx, bond);
								if (from && to && from !== to) options.onReorder(from, to, bond, event);
								source = undefined;
							},
							ondragend: () => {
								source = undefined;
							}
						})
					}
				: undefined
	});
}

export interface LongPressPolicyOptions {
	role?: string;
	delay?: number;
	disabled?: PolicyGuard;
	onLongPress: (bond: Bond, event: PointerEvent) => void;
}

export function longPressPolicy(options: LongPressPolicyOptions): Capability<void> {
	const role = options.role ?? 'control';
	const delay = options.delay ?? 500;
	let timer: ReturnType<typeof setTimeout> | undefined;

	const clear = () => {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
	};

	return definePolicyCapability<void>({
		slot: LONG_PRESS_POLICY,
		meta: {
			projects: [role],
			docs: 'Press-and-hold policy for delayed pointer activation.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						handlers: (bond) => ({
							onpointerdown: (event: PointerEvent) => {
								clear();
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								timer = setTimeout(() => {
									timer = undefined;
									options.onLongPress(bond, event);
								}, delay);
							},
							onpointerup: clear,
							onpointercancel: clear,
							onpointerleave: clear
						}),
						onmount: () => clear
					}
				: undefined
	});
}

export interface SwipePolicyDetail {
	direction: SwipeDirection;
	startX: number;
	startY: number;
	x: number;
	y: number;
	deltaX: number;
	deltaY: number;
}

export interface SwipePolicyOptions {
	role?: string;
	threshold?: number;
	directions?: readonly SwipeDirection[];
	disabled?: PolicyGuard;
	onSwipe: (detail: SwipePolicyDetail, bond: Bond, event: PointerEvent) => void;
}

export function swipePolicy(options: SwipePolicyOptions): Capability<void> {
	const role = options.role ?? 'surface';
	const threshold = options.threshold ?? 30;
	const directions = options.directions ?? ['left', 'right', 'up', 'down'];
	let start: { x: number; y: number } | undefined;

	return definePolicyCapability<void>({
		slot: SWIPE_POLICY,
		meta: {
			projects: [role],
			docs: 'Pointer swipe policy for navigation or dismissal gestures.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						handlers: (bond) => ({
							onpointerdown: (event: PointerEvent) => {
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								start = { x: event.clientX, y: event.clientY };
							},
							onpointerup: (event: PointerEvent) => {
								if (!start || shouldSkipPolicy(options.disabled, bond, event)) {
									start = undefined;
									return;
								}
								const detail = swipeDetail(start, event);
								start = undefined;
								if (!detail) return;
								if (!directions.includes(detail.direction)) return;
								if (Math.max(Math.abs(detail.deltaX), Math.abs(detail.deltaY)) < threshold) return;
								options.onSwipe(detail, bond, event);
							},
							onpointercancel: () => {
								start = undefined;
							}
						})
					}
				: undefined
	});
}

type PointerDragConfig = {
	slot: symbol;
	role: string;
	axis?: DragAxis | undefined;
	disabled?: PolicyGuard | undefined;
	docs: string;
	onStart?: ((detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void) | undefined;
	onMove: (detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void;
	onEnd?: ((detail: DragPolicyDetail, bond: Bond, event: PointerEvent) => void) | undefined;
};

function pointerDragPolicy(config: PointerDragConfig): Capability<void> {
	let start: { pointerId: number; x: number; y: number } | undefined;

	return definePolicyCapability<void>({
		slot: config.slot,
		meta: {
			projects: [config.role],
			docs: config.docs
		},
		behavior: (projectedRole) =>
			projectedRole === config.role
				? {
						handlers: (bond) => ({
							onpointerdown: (event: PointerEvent) => {
								if (shouldSkipPolicy(config.disabled, bond, event)) return;
								start = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
								capturePointer(event);
								const detail = dragDetail(start, event, config.axis);
								config.onStart?.(detail, bond, event);
							},
							onpointermove: (event: PointerEvent) => {
								if (!start || event.pointerId !== start.pointerId) return;
								if (shouldSkipPolicy(config.disabled, bond, event)) return;
								config.onMove(dragDetail(start, event, config.axis), bond, event);
							},
							onpointerup: (event: PointerEvent) => {
								if (!start || event.pointerId !== start.pointerId) return;
								const detail = dragDetail(start, event, config.axis);
								start = undefined;
								config.onEnd?.(detail, bond, event);
							},
							onpointercancel: (event: PointerEvent) => {
								if (!start || event.pointerId !== start.pointerId) return;
								const detail = dragDetail(start, event, config.axis);
								start = undefined;
								config.onEnd?.(detail, bond, event);
							}
						})
					}
				: undefined
	});
}

function isDisabled(guard: PolicyGuard | undefined, bond: Bond, event?: Event): boolean {
	if (typeof guard === 'boolean') return guard;
	if (typeof guard === 'function') return guard(bond, event);
	const state = bond.state as { isDisabled?: boolean; props?: { disabled?: boolean } };
	return Boolean(state.isDisabled ?? state.props?.disabled ?? false);
}

function shouldSkipPolicy(guard: PolicyGuard | undefined, bond: Bond, event: Event): boolean {
	if (event.defaultPrevented) return true;
	if ('button' in event && event.button === 2) return true;
	return isDisabled(guard, bond, event);
}

function clearKnownSurfaces(bond: Bond, field: string | undefined): void {
	const input = bond.state.surface(INPUT);
	if (input?.clear(field)) return;

	const selection = bond.state.surface(SELECTION) as SelectionModel<unknown> | undefined;
	if (selection && selection.values.length > 0) selection.clear();
}

function dragDetail(
	start: { pointerId: number; x: number; y: number },
	event: PointerEvent,
	axis: DragAxis = 'both'
): DragPolicyDetail {
	const rawDeltaX = event.clientX - start.x;
	const rawDeltaY = event.clientY - start.y;
	const deltaX = axis === 'y' ? 0 : rawDeltaX;
	const deltaY = axis === 'x' ? 0 : rawDeltaY;
	return {
		pointerId: start.pointerId,
		startX: start.x,
		startY: start.y,
		x: start.x + deltaX,
		y: start.y + deltaY,
		deltaX,
		deltaY
	};
}

function trackPressDetail(event: PointerEvent): TrackPressDetail {
	const target = event.currentTarget as { getBoundingClientRect?: () => DOMRect } | null;
	const rect = target?.getBoundingClientRect?.();
	const x = event.clientX - (rect?.left ?? 0);
	const y = event.clientY - (rect?.top ?? 0);
	const width = rect?.width ?? 0;
	const height = rect?.height ?? 0;
	return {
		x,
		y,
		percentX: width > 0 ? clampPercent((x / width) * 100) : 0,
		percentY: height > 0 ? clampPercent((y / height) * 100) : 0
	};
}

function capturePointer(event: PointerEvent): void {
	const target = event.currentTarget as { setPointerCapture?: (pointerId: number) => void } | null;
	target?.setPointerCapture?.(event.pointerId);
}

function reorderId(
	options: ReorderDragPolicyOptions,
	ctx: unknown,
	bond: Bond
): string | undefined {
	if (options.getId) return options.getId(ctx, bond);
	return typeof ctx === 'string' ? ctx : undefined;
}

function swipeDetail(
	start: { x: number; y: number },
	event: PointerEvent
): SwipePolicyDetail | undefined {
	const deltaX = event.clientX - start.x;
	const deltaY = event.clientY - start.y;
	if (deltaX === 0 && deltaY === 0) return undefined;
	const horizontal = Math.abs(deltaX) >= Math.abs(deltaY);
	const direction: SwipeDirection = horizontal
		? deltaX < 0
			? 'left'
			: 'right'
		: deltaY < 0
			? 'up'
			: 'down';
	return {
		direction,
		startX: start.x,
		startY: start.y,
		x: event.clientX,
		y: event.clientY,
		deltaX,
		deltaY
	};
}

function clampPercent(value: number): number {
	if (value < 0) return 0;
	if (value > 100) return 100;
	return value;
}
