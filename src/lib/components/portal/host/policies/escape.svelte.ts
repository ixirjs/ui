import {
	definePolicyCapability,
	sharedCapabilityKey,
	type Capability
} from '$svelte-atoms/core/shared/bond';
import { INPUT } from '$svelte-atoms/core/shared/capability/models/input.svelte';
import { isTopOverlay, useEscapeStack } from './escape-stack.svelte';
import type { OverlayView, EscapeOutcome } from '../types';
import { closeOverlay, overlayIsDisabled } from './overlay-view';

export const ESCAPE = sharedCapabilityKey<EscapeHandler>('@svelte-atoms/cap:escape');

export type { EscapeOutcome };

export type EscapeHandler = (bond: OverlayView, ev: KeyboardEvent) => void;

// Prefer the pre-built constants below for common cases.
export function escapePolicy(
	onEscape: EscapeHandler,
	opts: { enabled?: boolean; requires?: readonly symbol[] } = {}
): Capability<EscapeHandler> {
	const enabled = opts.enabled !== false;
	return definePolicyCapability<EscapeHandler>({
		slot: ESCAPE,
		surface: onEscape,
		...(opts.requires ? { requires: opts.requires } : {}),
		meta: {
			projects: ['surface'],
			docs: 'Escape-key dismissal policy with overlay stack enrollment setup.'
		},
		// Whole-bond effect: enroll this overlay in the escape stack while open,
		// run via `useCapabilities` like the focus capability's restore setup — no per-root hook.
		setup: (bond) => useEscapeStack(bond as OverlayView),
		roles: {
			surface: () => ({
				handlers: (bond) => ({
					onkeydown: (ev: Event) => {
						const e = ev as KeyboardEvent;
						if (e.key !== 'Escape') return;
						if (!enabled) return;
						// Stack coordination: under Portal containment overlays DOM-nest, so
						// one Escape bubbles through both surfaces' handlers. Only the topmost open overlay
						// acts; an enclosing overlay lets the event pass (no preventDefault) so it never
						// double-closes. Un-enrolled bonds count as top (backward-compat).
						if (!isTopOverlay(bond as OverlayView)) return;
						if (overlayIsDisabled(bond as OverlayView)) return;
						e.preventDefault();
						onEscape(bond as OverlayView, e);
					}
				})
			})
		}
	});
}

export const closeOnEscape: Capability<EscapeHandler> = escapePolicy((bond) => {
	closeOverlay(bond);
});

export const ignoreEscape: Capability<EscapeHandler> = escapePolicy(() => {
	// no-op: Escape is still prevented but the overlay stays open.
});

// First Escape clears input; second Escape closes. For Combobox and Select.
export const clearThenClose: Capability<EscapeHandler> = escapePolicy(
	(bond) => {
		if (bond.state.surface(INPUT)?.clear()) return;
		closeOverlay(bond);
	},
	{ requires: [INPUT] }
);
