import type { Capability } from '../../bond.svelte';
import type { OverlayView, EscapeOutcome } from '../types';
import type { InputModel } from '../../capabilities/input.svelte';

export type { EscapeOutcome };

// Handler signature passed to escapePolicy.
export type EscapeHandler = (bond: OverlayView, ev: KeyboardEvent) => void;

// Low-level factory: gates `onEscape` behind the key check, `enabled` flag, and `isDisabled`, then projects onto `'surface'`.
// Prefer the pre-built constants (closeOnEscape, ignoreEscape, clearThenClose) for common cases.
export function escapePolicy(
	onEscape: EscapeHandler,
	opts: { enabled?: boolean } = {}
): Capability<EscapeHandler> {
	const enabled = opts.enabled !== false;
	return {
		slot: 'escape',
		surface: onEscape,
		behavior(role) {
			if (role !== 'surface') return undefined;
			return {
				handlers: (bond) => ({
					onkeydown: (ev: Event) => {
						const e = ev as KeyboardEvent;
						if (e.key !== 'Escape') return;
						if (!enabled) return;
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
export const clearThenClose: Capability<EscapeHandler> = escapePolicy((bond) => {
	const input = bond.capability<InputModel>('input')?.surface;
	if (input?.clear()) return;
	bond.state.close();
});
