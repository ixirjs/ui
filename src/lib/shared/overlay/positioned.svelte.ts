import { type BondElements } from '../bond.svelte';

export type PositionedOverlayElements = BondElements & {
	trigger?: HTMLElement;
	overlay?: HTMLElement;
	content?: HTMLElement;
};

// The `PositionedOverlay` base class is gone — Popover (and its subclasses) author
// over `Bond` with the `positionedCapabilities()` bundle (docs/extensibility-vision.md
// §13). Only the element shape remains here.
