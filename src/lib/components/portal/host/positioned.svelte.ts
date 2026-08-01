import { type BondElements } from '$svelte-atoms/core/shared/bond';

export type PositionedOverlayElements = BondElements & {
	trigger?: HTMLElement;
	overlay?: HTMLElement;
	content?: HTMLElement;
};

// Popover and subclasses author over Bond + positionedCapabilities();
// only the element shape remains here.
