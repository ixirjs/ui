import type { Atom } from '$svelte-atoms/core/shared/bond';
import type { OverlayView } from '../types';

type LegacyOverlayState = {
	isOpen?: boolean;
	isDisabled?: boolean;
	open?: () => void;
	close?: () => void;
	toggle?: () => void;
};

function legacyState(bond: OverlayView | undefined): LegacyOverlayState | undefined {
	return bond?.state as LegacyOverlayState | undefined;
}

export function overlayIsOpen(bond: OverlayView | undefined): boolean {
	return bond?.isOpen ?? legacyState(bond)?.isOpen ?? false;
}

export function overlayIsDisabled(bond: OverlayView | undefined): boolean {
	return bond?.isDisabled ?? legacyState(bond)?.isDisabled ?? false;
}

export function closeOverlay(bond: OverlayView): void {
	if (typeof bond.close === 'function') {
		bond.close();
		return;
	}
	legacyState(bond)?.close?.();
}

export function openOverlay(bond: OverlayView): void {
	if (typeof bond.open === 'function') {
		bond.open();
		return;
	}
	legacyState(bond)?.open?.();
}

export function toggleOverlay(bond: OverlayView): void {
	if (typeof bond.toggle === 'function') {
		bond.toggle();
		return;
	}
	legacyState(bond)?.toggle?.();
}

export function overlayNode<N extends Atom = Atom>(
	bond: OverlayView | undefined,
	key: string
): N | undefined {
	return (typeof bond?.node === 'function' ? bond.node<N>(key) : undefined) as N | undefined;
}
