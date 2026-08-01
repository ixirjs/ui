import { type BondElements } from '$svelte-atoms/core/shared/bond.svelte';

export type PositionedOverlayElements = BondElements & {
	trigger?: HTMLElement;
	overlay?: HTMLElement;
	content?: HTMLElement;
};

// Popover and subclasses author over Bond + positionedCapabilities() (docs/extensibility-vision.md §13);
// only the element shape remains here.
