// The owner a policy guard is handed. Structural on purpose: the models layer no longer knows the
// Bond class, and every caller is a plain state class that happens to expose these two facts.
export interface PolicyOwner {
	readonly isDisabled?: boolean;
	readonly props?: { readonly disabled?: boolean };
}

export type PolicyGuard = boolean | ((owner: PolicyOwner, event?: Event) => boolean);
export type PolicyAction<E extends Event = Event> = (owner: PolicyOwner, event: E) => void;
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

export function isDisabled(
	guard: PolicyGuard | undefined,
	owner: PolicyOwner,
	event?: Event
): boolean {
	if (typeof guard === 'boolean') return guard;
	if (typeof guard === 'function') return guard(owner, event);
	return Boolean(owner.isDisabled ?? owner.props?.disabled ?? false);
}

export function shouldSkipPolicy(
	guard: PolicyGuard | undefined,
	owner: PolicyOwner,
	event: Event
): boolean {
	if (event.defaultPrevented) return true;
	if ('repeat' in event && event.repeat) return true;
	if ('button' in event && typeof event.button === 'number' && event.button > 0) return true;
	if (event.type !== 'click' && 'isPrimary' in event && event.isPrimary === false) return true;
	return isDisabled(guard, owner, event);
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
