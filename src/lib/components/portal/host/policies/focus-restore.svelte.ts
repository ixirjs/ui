import type { OverlayView } from '../types';
import { FOCUS, type FocusPolicySurface } from './focus.svelte';
import { isBrowser } from '$svelte-atoms/core/utils/dom.svelte';
import { overlayIsOpen, overlayNode } from './overlay-view';

// State-reactive focus capture/restore for an overlay. Call once from the root component.
// $effect.pre snapshots activeElement on closed→open; $effect restores on open→closed regardless of how close was triggered.
export function useFocusRestore(bond: OverlayView | undefined): void {
	if (!bond) return;

	const focusSurface = bond.state.surface(FOCUS);
	let restoreTarget: HTMLElement | null = null;
	let wasOpen = false;

	// Capture activeElement before the overlay opens (pre-DOM-update phase, ahead of focus policy's queueMicrotask).
	$effect.pre(() => {
		if (!overlayIsOpen(bond)) return;
		if (focusSurface?.captureFocusOnOpen === false) return;
		if (!isBrowser()) return;
		restoreTarget = document.activeElement as HTMLElement | null;
	});

	// Restore on open→closed edge only; wasOpen guard prevents stealing focus on initial mount.
	$effect(() => {
		const open = overlayIsOpen(bond);
		if (!open && wasOpen) restoreFocusTo(bond, focusSurface, restoreTarget);
		wasOpen = open;
	});
}

// Resolve the configured focus-restore target and move focus to it.
function restoreFocusTo(
	bond: OverlayView,
	surface: FocusPolicySurface | undefined,
	previous: HTMLElement | null
): void {
	const target = surface?.restoreFocus ?? 'trigger';
	if (target === 'none') return;
	let el: HTMLElement | null | undefined;
	if (target === 'trigger') el = overlayNode(bond, 'trigger')?.element as HTMLElement | undefined;
	else if (target === 'previous') el = previous;
	else if (typeof target === 'function') el = target();
	el?.focus?.();
}
