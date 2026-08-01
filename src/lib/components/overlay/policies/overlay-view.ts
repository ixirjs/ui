import type { Atom } from '$ixirjs/ui/shared/bond';
import type { OverlayView } from '$ixirjs/ui/components/overlay/types';

export function overlayIsOpen(bond: OverlayView | undefined): boolean {
	return bond?.isOpen ?? false;
}

export function overlayIsDisabled(bond: OverlayView | undefined): boolean {
	return bond?.isDisabled ?? false;
}

export function overlayIsModal(bond: OverlayView | undefined): boolean {
	return bond?.modal ?? true;
}

export function closeOverlay(bond: OverlayView): void {
	bond.close();
}

export function openOverlay(bond: OverlayView): void {
	bond.open();
}

export function toggleOverlay(bond: OverlayView): void {
	bond.toggle();
}

export function overlayNode<N extends Atom = Atom>(
	bond: OverlayView | undefined,
	key: string
): N | undefined {
	return bond?.nodeByPart<N>(key);
}
