import type { Bond } from '$ixirjs/ui/shared/bond';
import { INPUT } from '$ixirjs/ui/shared/capability/models/input.svelte';
import {
	SELECTION,
	type SelectionModel
} from '$ixirjs/ui/shared/capability/models/selection.svelte';

export type PolicyGuard = boolean | ((bond: Bond, event?: Event) => boolean);
export type PolicyAction<E extends Event = Event> = (bond: Bond, event: E) => void;
export type DragAxis = 'x' | 'y' | 'both';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface DragPolicyDetail {
	pointerId: number;
	startX: number;
	startY: number;
	x: number;
	y: number;
	deltaX: number;
	deltaY: number;
}

export interface TrackPressDetail {
	x: number;
	y: number;
	percentX: number;
	percentY: number;
}

export function isDisabled(guard: PolicyGuard | undefined, bond: Bond, event?: Event): boolean {
	if (typeof guard === 'boolean') return guard;
	if (typeof guard === 'function') return guard(bond, event);
	const direct = bond as Bond & { isDisabled?: boolean; props: { disabled?: boolean } };
	return Boolean(direct.isDisabled ?? direct.props.disabled ?? false);
}

export function shouldSkipPolicy(
	guard: PolicyGuard | undefined,
	bond: Bond,
	event: Event
): boolean {
	if (event.defaultPrevented) return true;
	if ('repeat' in event && event.repeat) return true;
	if ('button' in event && typeof event.button === 'number' && event.button > 0) return true;
	if (event.type !== 'click' && 'isPrimary' in event && event.isPrimary === false) return true;
	return isDisabled(guard, bond, event);
}

export function clearKnownSurfaces(bond: Bond, field: string | undefined): void {
	const input = bond.surface(INPUT);
	if (input?.clear(field)) return;

	const selection = bond.surface(SELECTION) as SelectionModel<unknown> | undefined;
	if (selection && selection.values.length > 0) selection.clear();
}

export function dragDetail(
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

export function trackPressDetail(event: PointerEvent): TrackPressDetail {
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

export function capturePointer(event: PointerEvent): void {
	const target = event.currentTarget as { setPointerCapture?: (pointerId: number) => void } | null;
	target?.setPointerCapture?.(event.pointerId);
}

export function releasePointer(event: PointerEvent): void {
	const target = event.currentTarget as {
		hasPointerCapture?: (pointerId: number) => boolean;
		releasePointerCapture?: (pointerId: number) => void;
	} | null;
	if (target?.hasPointerCapture?.(event.pointerId) === false) return;
	target?.releasePointerCapture?.(event.pointerId);
}

function clampPercent(value: number): number {
	if (value < 0) return 0;
	if (value > 100) return 100;
	return value;
}
