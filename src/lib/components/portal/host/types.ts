import type { Bond, BondStateProps, BondVirtualElement } from '$svelte-atoms/core/shared/bond';

// Minimal bond shape overlay capabilities depend on. Migrated overlays expose lifecycle on the
// Bond; legacy overlays can satisfy this by delegating to their state during their migration slice.
export type OverlayView = Bond & {
	readonly isOpen?: boolean;
	readonly isDisabled?: boolean;
	open?: () => void;
	close?: () => void;
	toggle?: () => void;
};

// Minimum shape every overlay state must satisfy. Flavours extend with their own props.
export type OverlayStateProps = BondStateProps & {
	open: boolean;
	disabled?: boolean;
	readonly rest?: Record<string, unknown>;
};

// Canonical overlay config value-types; per-capability options pick from these via indexed access.
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
