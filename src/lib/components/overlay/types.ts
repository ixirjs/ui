import type { BondStateProps, BondVirtualElement } from '$svelte-atoms/core/shared/bond.svelte';
import type { ViewOf } from '$svelte-atoms/core/shared/define-bond.svelte';
import type { OverlayState } from './bond.svelte';

// Minimal bond shape overlay capabilities depend on: any Bond whose state is an OverlayState.
// Expressed via the spec-derived `ViewOf` utility (the SSOT for `Bond & { state: S }`).
export type OverlayView = ViewOf<OverlayState>;

// Minimum shape every overlay state must satisfy. Flavours extend with their own props.
export type OverlayStateProps = BondStateProps & {
	open: boolean;
	disabled?: boolean;
	readonly rest?: Record<string, unknown>;
};

// Canonical overlay config value-types; per-capability options pick from these via indexed access (§13 Stage 4).
export type OverlayKnobs = {
	// trigger's aria-haspopup value.
	ariaHasPopup?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid' | true | false;
	// Where focus returns when the overlay closes.
	restoreFocus?: 'trigger' | 'previous' | 'none' | (() => HTMLElement | null);
	// Whether opening captures `document.activeElement` for restoration.
	captureFocusOnOpen?: boolean;
};

export type EscapeOutcome = 'close' | 'ignore' | 'clear-and-close' | 'handled';

export type { BondVirtualElement };
