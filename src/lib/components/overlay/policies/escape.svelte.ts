import { sharedCapabilityKey, type Capability } from '$svelte-atoms/core/shared/bond.svelte';
import { INPUT } from '$svelte-atoms/core/shared/capabilities/input.svelte';
import { isTopOverlay, useEscapeStack } from './escape-stack.svelte';
import type { OverlayView, EscapeOutcome } from '../types';

// Public slot key for the escape policy.
export const ESCAPE = sharedCapabilityKey<EscapeHandler>('@svelte-atoms/cap:escape');

export type { EscapeOutcome };

// Handler signature passed to escapePolicy.
export type EscapeHandler = (bond: OverlayView, ev: KeyboardEvent) => void;

// Low-level factory: gates `onEscape` behind the key check, `enabled` flag, and `isDisabled`, then projects onto `'surface'`.
// Prefer the pre-built constants below for common cases.
export function escapePolicy(
	onEscape: EscapeHandler,
	opts: { enabled?: boolean; requires?: readonly symbol[] } = {}
): Capability<EscapeHandler> {
	const enabled = opts.enabled !== false;
	return {
		slot: ESCAPE,
		surface: onEscape,
		...(opts.requires ? { requires: opts.requires } : {}),
		// Whole-bond effect: enroll this overlay in the escape stack while open (ADR 0009 D2),
		// run via `useCapabilities` like the focus capability's restore setup — no per-root hook.
		setup: (bond) => useEscapeStack(bond as OverlayView),
		behavior(role) {
			if (role !== 'surface') return undefined;
			return {
				handlers: (bond) => ({
					onkeydown: (ev: Event) => {
						const e = ev as KeyboardEvent;
						if (e.key !== 'Escape') return;
						if (!enabled) return;
						// Stack coordination (ADR 0009 D1): under Portal containment overlays DOM-nest, so
						// one Escape bubbles through both surfaces' handlers. Only the topmost open overlay
						// acts; an enclosing overlay lets the event pass (no preventDefault) so it never
						// double-closes. Un-enrolled bonds count as top (backward-compat).
						if (!isTopOverlay(bond as OverlayView)) return;
						if ((bond as OverlayView).state.isDisabled) return;
						e.preventDefault();
						onEscape(bond as OverlayView, e);
					}
				})
			};
		}
	};
}

// Close the overlay on Escape. The common default.
export const closeOnEscape: Capability<EscapeHandler> = escapePolicy((bond) => {
	bond.state.close();
});

// Ignore Escape — for non-dismissible overlays.
export const ignoreEscape: Capability<EscapeHandler> = escapePolicy(() => {
	// no-op: Escape is still prevented but the overlay stays open.
});

// First Escape clears the overlay's `'input'` capability; second Escape closes. Used by Combobox and Select.
export const clearThenClose: Capability<EscapeHandler> = escapePolicy(
	(bond) => {
		const input = bond.capability(INPUT)?.surface;
		if (input?.clear()) return;
		bond.state.close();
	},
	{ requires: [INPUT] }
);
