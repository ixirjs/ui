import {
	defineCapability,
	sharedCapabilityKey,
	type Capability,
	type CapabilityKey
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import {
	capturePointer,
	dragDetail,
	releasePointer,
	shouldSkipPolicy,
	trackPressDetail,
	type DragAxis,
	type DragPolicyDetail,
	type PolicyGuard,
	type TrackPressDetail
} from '$ixirjs/ui/shared/capability/models/interaction-policies/shared';

export const THUMB_DRAG_POLICY = sharedCapabilityKey<void>('@ixirjs/cap:thumb-drag');
export const TRACK_PRESS_POLICY = sharedCapabilityKey<void>('@ixirjs/cap:track-press');
export const RESIZE_HANDLE_POLICY = sharedCapabilityKey<void>('@ixirjs/cap:resize-handle');

export interface ThumbDragPolicyOptions {
	role?: string;
	axis?: DragAxis;
	disabled?: PolicyGuard;
	onStart?: DragPolicyHandler;
	onDrag: DragPolicyHandler;
	onEnd?: DragPolicyHandler;
}

/**
 * A role's projection context, forwarded to every callback.
 *
 * One Bond may own several draggable thumbs — Scrollable's two scrollbars, a range slider's two
 * handles — but a capability occupies one slot per Bond, so it cannot be registered twice. Each
 * thumb instead projects the same role with its own `ctx` (`atom.role('thumb', 'x')`), and the
 * policy hands that value back so the Bond knows which one moved.
 */
export type DragPolicyHandler = (
	detail: DragPolicyDetail,
	bond: Bond,
	event: PointerEvent,
	ctx: unknown
) => void;

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

export interface TrackPressPolicyOptions {
	role?: string;
	disabled?: PolicyGuard;
	preventDefault?: boolean;
	onPress: (detail: TrackPressDetail, bond: Bond, event: PointerEvent, ctx: unknown) => void;
}

export function trackPressPolicy(options: TrackPressPolicyOptions): Capability<void> {
	const role = options.role ?? 'track';
	const preventDefault = options.preventDefault ?? true;

	return defineCapability<void>({
		slot: TRACK_PRESS_POLICY,
		meta: {
			projects: [role],
			docs: 'Pointer press policy for moving a value or scroll position from track presses.'
		},
		behavior: (projectedRole, ctx) =>
			projectedRole === role
				? {
						handlers: (bond) => ({
							onpointerdown: (event: PointerEvent) => {
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								if (preventDefault) event.preventDefault();
								options.onPress(trackPressDetail(event), bond, event, ctx);
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
	onStart?: DragPolicyHandler;
	onResize: DragPolicyHandler;
	onEnd?: DragPolicyHandler;
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

type PointerDragConfig = {
	slot: CapabilityKey<void>;
	role: string;
	axis?: DragAxis | undefined;
	disabled?: PolicyGuard | undefined;
	docs: string;
	onStart?: DragPolicyHandler | undefined;
	onMove: DragPolicyHandler;
	onEnd?: DragPolicyHandler | undefined;
};

function pointerDragPolicy(config: PointerDragConfig): Capability<void> {
	return defineCapability<void>({
		slot: config.slot,
		meta: {
			projects: [config.role],
			docs: config.docs
		},
		behavior: (projectedRole, ctx) => {
			if (projectedRole !== config.role) return undefined;
			// Per projection, not per capability: one Bond may project this role onto several parts
			// (Scrollable's two thumbs), and each needs its own in-flight drag.
			let start: { pointerId: number; x: number; y: number } | undefined;
			return {
				handlers: (bond) => ({
					onpointerdown: (event: PointerEvent) => {
						if (shouldSkipPolicy(config.disabled, bond, event)) return;
						start = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
						capturePointer(event);
						config.onStart?.(dragDetail(start, event, config.axis), bond, event, ctx);
					},
					onpointermove: (event: PointerEvent) => {
						if (!start || event.pointerId !== start.pointerId) return;
						if (shouldSkipPolicy(config.disabled, bond, event)) {
							releasePointer(event);
							start = undefined;
							return;
						}
						config.onMove(dragDetail(start, event, config.axis), bond, event, ctx);
					},
					onpointerup: (event: PointerEvent) => {
						if (!start || event.pointerId !== start.pointerId) return;
						const initial = start;
						releasePointer(event);
						start = undefined;
						if (shouldSkipPolicy(config.disabled, bond, event)) return;
						config.onEnd?.(dragDetail(initial, event, config.axis), bond, event, ctx);
					},
					onpointercancel: (event: PointerEvent) => {
						if (!start || event.pointerId !== start.pointerId) return;
						const initial = start;
						releasePointer(event);
						start = undefined;
						// A cancelled drag still has to run onEnd, or state staged in onStart
						// (Scrollable's `isScrolling`) is stuck on until the next drag.
						config.onEnd?.(dragDetail(initial, event, config.axis), bond, event, ctx);
					}
				})
			};
		}
	});
}
