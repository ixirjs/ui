import type { OverlayView } from '../types';

// Focus-ordered registry of currently-open overlays (ADR 0009 D1). Under Portal containment
// (ADR 0008) overlays DOM-nest, so one Escape keydown bubbles through both surfaces' handlers;
// this stack coordinates so only the topmost overlay acts. Read synchronously in the keydown
// handler, so a plain array (not a reactive store) is correct.
const stack: OverlayView[] = [];

// Enroll `bond` as the topmost open overlay; returns an unenroll thunk for `return enrollOverlay(bond)`
// from an $effect. Re-enrolling an already-present bond moves it back to the top (defensive).
export function enrollOverlay(bond: OverlayView): () => void {
	remove(bond);
	stack.push(bond);
	return () => remove(bond);
}

// May `bond` act on Escape? True when it is the top of the stack OR not enrolled at all
// (opted-out overlays and unit-test bonds still act; only a higher enrolled overlay suppresses one below).
export function isTopOverlay(bond: OverlayView): boolean {
	const i = stack.indexOf(bond);
	if (i === -1) return true;
	return i === stack.length - 1;
}

function remove(bond: OverlayView): void {
	const i = stack.indexOf(bond);
	if (i !== -1) stack.splice(i, 1);
}

// State-reactive enrollment for an overlay (ADR 0009 D2): enroll on closed→open, unenroll on
// open→close or unmount. Call once from the root component; not calling it opts out of coordination.
export function useEscapeStack(bond: OverlayView | undefined): void {
	if (!bond) return;

	$effect(() => {
		if (!bond.state.isOpen) return;
		return enrollOverlay(bond);
	});
}
