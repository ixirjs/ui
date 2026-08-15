import type { Bond, BondStateProps, BondVirtualElement } from '$ixirjs/ui/shared/bond';

// Minimal bond shape overlay capabilities depend on. Overlay state and lifecycle live directly on
// the Bond; callers do not need a compatibility state facade.
export type OverlayView = Bond & {
	readonly isOpen: boolean;
	readonly isDisabled: boolean;
	/** Defaults to true so existing overlay bonds retain modal behavior. */
	readonly modal?: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
};

// Minimum shape every overlay state must satisfy. Flavours extend with their own props.
export type OverlayStateProps = BondStateProps & {
	open: boolean;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Whether this overlay applies modal ARIA, focus, and document effects. */
	modal?: boolean;
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
