import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import {
	isDisabled,
	shouldSkipPolicy,
	type PolicyGuard,
	type SwipeDirection
} from '$ixirjs/ui/shared/capability/models/interaction-policies/shared';

export const REORDER_DRAG_POLICY = sharedCapabilityKey<void>({
	owner: '@ixirjs/cap',
	name: 'reorder-drag',
	version: 1
});
export const LONG_PRESS_POLICY = sharedCapabilityKey<void>({
	owner: '@ixirjs/cap',
	name: 'long-press',
	version: 1
});
export const SWIPE_POLICY = sharedCapabilityKey<void>({
	owner: '@ixirjs/cap',
	name: 'swipe',
	version: 1
});

export interface ReorderDragPolicyOptions {
	role?: string;
	disabled?: PolicyGuard;
	getId?: (ctx: unknown, bond: Bond) => string | undefined;
	onReorder: (from: string, to: string, bond: Bond, event: DragEvent) => void;
}

export function reorderDragPolicy(options: ReorderDragPolicyOptions): Capability<void> {
	const role = options.role ?? 'item';
	let source: { id: string; bond: Bond } | undefined;

	return defineCapability<void>({
		slot: REORDER_DRAG_POLICY,
		meta: {
			projects: [role],
			docs: 'Drag/drop reordering policy for item-like roles.'
		},
		behavior: (projectedRole, ctx) =>
			projectedRole === role
				? {
						attrs: (bond) => ({
							draggable: !isDisabled(options.disabled, bond)
						}),
						handlers: (bond) => ({
							ondragstart: (event: DragEvent) => {
								source = undefined;
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								const id = reorderId(options, ctx, bond);
								if (!id) return;
								source = { id, bond };
								event.dataTransfer?.setData('text/plain', id);
							},
							ondragover: (event: DragEvent) => {
								if (shouldSkipPolicy(options.disabled, bond, event) || source?.bond !== bond)
									return;
								event.preventDefault();
							},
							ondrop: (event: DragEvent) => {
								if (shouldSkipPolicy(options.disabled, bond, event) || source?.bond !== bond)
									return;
								event.preventDefault();
								const from = source.id;
								const to = reorderId(options, ctx, bond);
								source = undefined;
								if (to && from !== to) options.onReorder(from, to, bond, event);
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
	let pointerId: number | undefined;

	const clear = (nextPointerId?: number) => {
		if (nextPointerId !== undefined && pointerId !== nextPointerId) return;
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
		pointerId = undefined;
	};

	return defineCapability<void>({
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
								pointerId = event.pointerId;
								timer = setTimeout(() => {
									timer = undefined;
									pointerId = undefined;
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									options.onLongPress(bond, event);
								}, delay);
							},
							onpointerup: (event: PointerEvent) => clear(event.pointerId),
							onpointercancel: (event: PointerEvent) => clear(event.pointerId),
							onpointerleave: (event: PointerEvent) => clear(event.pointerId)
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
	let start: { pointerId: number; x: number; y: number } | undefined;

	return defineCapability<void>({
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
								start = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
							},
							onpointerup: (event: PointerEvent) => {
								if (!start || event.pointerId !== start.pointerId) return;
								const initial = start;
								start = undefined;
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								const detail = swipeDetail(initial, event);
								if (!detail) return;
								if (!directions.includes(detail.direction)) return;
								if (Math.max(Math.abs(detail.deltaX), Math.abs(detail.deltaY)) < threshold) return;
								options.onSwipe(detail, bond, event);
							},
							onpointercancel: (event: PointerEvent) => {
								if (start?.pointerId === event.pointerId) start = undefined;
							}
						})
					}
				: undefined
	});
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
