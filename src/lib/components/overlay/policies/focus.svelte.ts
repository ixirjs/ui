import { sharedCapabilityKey, type Capability } from '$svelte-atoms/core/shared/bond.svelte';
import type { OverlayView, OverlayKnobs } from '../types';
import { focus, focusTrap as tabTrap } from '$svelte-atoms/core/utils/dom.svelte';
import { useFocusRestore } from './focus-restore.svelte';

// Public slot key for the focus policy — retrieved by fuse/tests for restoreFocus introspection.
export const FOCUS = sharedCapabilityKey<FocusPolicySurface>('@svelte-atoms/cap:focus');

// Configuration surface of a focus policy — read by useFocusRestore.
export type FocusPolicySurface = {
	readonly restoreFocus?: OverlayKnobs['restoreFocus'];
	readonly captureFocusOnOpen?: boolean;
};

function focusFirstOnOpen(bond: OverlayView, node: HTMLElement): void {
	if (!bond.state.isOpen) return;
	queueMicrotask(() => focus(node));
}

// One general focus policy; `trapTab` is the only axis that distinguishes the variants below.
// Both move focus to the first focusable child on open and own the capture/restore effect
// (ADR 0003, driven by useCapabilities #5); trapped additionally cycles Tab within content.
function focusPolicy(opts: FocusPolicySurface, trapTab: boolean): Capability<FocusPolicySurface> {
	return {
		slot: FOCUS,
		surface: opts,
		setup: (bond) => useFocusRestore(bond as OverlayView),
		behavior(role) {
			if (role === 'content') {
				return {
					onmount: (node, bond) => focusFirstOnOpen(bond as OverlayView, node as HTMLElement)
				};
			}
			if (trapTab && role === 'surface') {
				return {
					handlers: () => ({
						onkeydown: ((ev: Event) => tabTrap(ev as KeyboardEvent)) as (ev: Event) => void
					})
				};
			}
			return undefined;
		}
	};
}

// Trapped focus — Tab cycles within content; moves focus to first focusable child on open. Default for modal overlays.
export function trappedFocus(opts: FocusPolicySurface = {}): Capability<FocusPolicySurface> {
	return focusPolicy(opts, true);
}

// Focus-on-open — moves focus to first focusable child on open; Tab not trapped. Default for positioned overlays.
export function focusOnOpen(opts: FocusPolicySurface = {}): Capability<FocusPolicySurface> {
	return focusPolicy(opts, false);
}

// No focus management — tooltips and other non-interactive overlays.
export const noFocus: Capability<FocusPolicySurface> = {
	slot: FOCUS,
	surface: {},
	behavior: () => undefined
};
