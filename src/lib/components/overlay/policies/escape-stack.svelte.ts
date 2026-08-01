import {
	PortalsBond,
	type PortalsBond as PortalsBondView
} from '$ixirjs/ui/components/portal/registry';
import type { OverlayView } from '$ixirjs/ui/components/overlay/types';
import { overlayIsOpen } from './overlay-view';

// Fallback stack for tests and legacy callers outside a <Portals> context. Production roots
// capture PortalsBond during component setup, then keep overlay ordering scoped per app root.
const fallbackStack: OverlayView[] = [];
const overlayPortals = new WeakMap<OverlayView, PortalsBondView>();

// Enroll `bond` as the topmost open overlay; returns an unenroll thunk for `return enrollOverlay(bond)`
// from an $effect. Re-enrolling an already-present bond moves it back to the top (defensive).
export function enrollOverlay(bond: OverlayView, portals?: PortalsBondView): () => void {
	if (portals) {
		overlayPortals.set(bond, portals);
		const unenroll = portals.enrollOverlay(bond);
		return () => {
			unenroll();
			if (overlayPortals.get(bond) === portals) overlayPortals.delete(bond);
		};
	}
	remove(fallbackStack, bond);
	fallbackStack.push(bond);
	return () => remove(fallbackStack, bond);
}

// May `bond` act on Escape? True when it is the top of the stack OR not enrolled at all
// (opted-out overlays and unit-test bonds still act; only a higher enrolled overlay suppresses one below).
export function isTopOverlay(bond: OverlayView): boolean {
	const portals = overlayPortals.get(bond);
	if (portals) return portals.isTopOverlay(bond);
	const i = fallbackStack.indexOf(bond);
	if (i === -1) return true;
	return i === fallbackStack.length - 1;
}

// Test seam for the module-global stack. Production code should unenroll via the cleanup returned
// by enrollOverlay(); tests can reset leaked state without depending on private array identity.
export function resetEscapeStackForTest(): void {
	fallbackStack.splice(0);
}

function remove(stack: OverlayView[], bond: OverlayView): void {
	const i = stack.indexOf(bond);
	if (i !== -1) stack.splice(i, 1);
}

// State-reactive enrollment for an overlay: enroll on closed→open, unenroll on
// open→close or unmount. Call once from the root component; not calling it opts out of coordination.
export function useEscapeStack(bond: OverlayView | undefined): void {
	if (!bond) return;
	const portals = PortalsBond.get();

	$effect(() => {
		if (!overlayIsOpen(bond)) return;
		return enrollOverlay(bond, portals);
	});
}
