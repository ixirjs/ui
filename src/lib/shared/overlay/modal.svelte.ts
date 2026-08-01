import { BondAtom, type BondElements } from '../bond.svelte';
import type { OverlayView } from './types';
import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';

// Root atom for modal overlays. Wires the ARIA dialog contract (aria-modal, aria-labelledby, inert)
// and merges escape + focus-strategy handlers via .role('surface').
export class ModalRootAtom<B extends OverlayView = OverlayView> extends BondAtom<B, HTMLElement> {
	constructor(bond: B) {
		super(bond, 'root');
		// 'surface' role folds in focus-trap Tab-cycle and escape onkeydown via composeHandlers.
		this.role('surface');
	}

	override get attrs() {
		const titleId = getElementId(this.bond.id, `${this.bond.name}-title`);
		const descriptionId = getElementId(this.bond.id, `${this.bond.name}-description`);
		const hasTitle = !!this.bond.elements.title;
		const hasDescription = !!this.bond.elements.description;
		const isOpen = this.bond.state.isOpen;
		const isDisabled = this.bond.state.isDisabled;
		const isActive = isOpen && !isDisabled;

		return {
			...super.attrs,
			role: 'dialog',
			'aria-modal': true,
			'aria-labelledby': hasTitle ? titleId : undefined,
			'aria-describedby': hasDescription ? descriptionId : undefined,
			inert: !isActive ? '' : undefined,
			tabindex: -1,
			'data-open': isOpen
		};
	}

	// No hand-written handlers: both the focus-trap `onkeydown` and the escape
	// `onkeydown` are folded in by `.role('surface')` (focus + escape capabilities)
	// and chained via composeHandlers.
}

// Content atom for modal overlays. Invokes the focus strategy on mount via .role('content').
export class ModalContentAtom<B extends OverlayView = OverlayView> extends BondAtom<
	B,
	HTMLElement
> {
	constructor(bond: B) {
		super(bond, 'content');
		// 'content' role folds in focus-first-on-open onmount from the focus capability.
		this.role('content');
	}
}

export type ModalOverlayElements = BondElements & {
	root?: HTMLElement;
	content?: HTMLElement;
	title?: HTMLElement;
	description?: HTMLElement;
};

// The `ModalOverlay` base class is gone — Dialog/Drawer author via `defineBond`
// with the `modalCapabilities()` bundle (docs/extensibility-vision.md §13). What
// remains here is the shared modal *atoms* (root + content) and the element shape.
