import type { ComputePositionReturn } from '@floating-ui/dom';
import type { Atom } from '$ixirjs/ui/shared/bond';
import { overlayIsOpen } from '$ixirjs/ui/components/overlay/policies/overlay-view';
import type { OverlayView } from '$ixirjs/ui/components/overlay';

type PopoverPositionSurface = {
	position?: ComputePositionReturn;
	tracking?: boolean | undefined;
	computed?: Promise<ComputePositionReturn>;
	shouldTrackPosition?: boolean;
	notifyComputed?: (position: ComputePositionReturn) => void;
};

function popoverPositionSurface(bond: OverlayView): PopoverPositionSurface {
	return bond as unknown as PopoverPositionSurface;
}

export function getPopoverPosition(bond: OverlayView): ComputePositionReturn | undefined {
	return popoverPositionSurface(bond).position;
}

export function setPopoverTracking(bond: OverlayView, tracking: boolean | undefined): void {
	popoverPositionSurface(bond).tracking = tracking;
}

export function shouldTrackPopoverPosition(bond: OverlayView): boolean {
	return popoverPositionSurface(bond).shouldTrackPosition ?? overlayIsOpen(bond);
}

export function notifyPopoverComputed(bond: OverlayView, position: ComputePositionReturn): void {
	popoverPositionSurface(bond).notifyComputed?.call(bond, position);
}

export function popoverNode<N extends Atom = Atom>(bond: OverlayView, key: string): N | undefined {
	return bond.nodeByPart<N>(key);
}
