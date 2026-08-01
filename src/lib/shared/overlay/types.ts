import type { Bond, BondStateProps, BondVirtualElement } from '../bond.svelte';
import type { OverlayState } from './overlay.svelte';

// Minimal bond shape overlay strategies/capabilities depend on: any Bond whose state is
// an OverlayState. Strategies bind to this so they keep working with defineBond-authored overlays.
export type OverlayView = Bond & { state: OverlayState };

// Minimum shape every overlay state must satisfy. Flavours extend with their own props.
export type OverlayStateProps = BondStateProps & {
	open: boolean;
	disabled?: boolean;
	readonly rest?: Record<string, unknown>;
};

// Shared value-types for overlay configuration. The former cross-cutting knobs bag has
// dissolved into per-capability options (§13 Stage 4); this type survives as the canonical
// definition those capabilities pick from via indexed access.
export type OverlayKnobs = {
	// Value emitted on the trigger's aria-haspopup.
	ariaHasPopup?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid' | true | false;
	// Where focus returns when the overlay closes.
	restoreFocus?: 'trigger' | 'previous' | 'none' | (() => HTMLElement | null);
	// Whether opening captures `document.activeElement` for restoration.
	captureFocusOnOpen?: boolean;
};

export type EscapeOutcome = 'close' | 'ignore' | 'clear-and-close' | 'handled';

export type { BondVirtualElement };
