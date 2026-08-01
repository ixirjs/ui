import { BondAtom, type BondElements } from '$svelte-atoms/core/shared/bond.svelte';
import type { OverlayView } from './types';
import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';

// Root atom for modal overlays. Wires the ARIA dialog contract; .role('surface') folds in escape + focus handlers.
export class ModalRootAtom<B extends OverlayView = OverlayView> extends BondAtom<B, HTMLElement> {
	constructor(bond: B) {
		super(bond, 'root');
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

	// No hand-written handlers: focus-trap and escape onkeydown come from .role('surface'), chained via composeHandlers.
}

// Content atom for modal overlays. .role('content') folds in the focus capability's focus-first-on-open onmount.
export class ModalContentAtom<B extends OverlayView = OverlayView> extends BondAtom<
	B,
	HTMLElement
> {
	constructor(bond: B) {
		super(bond, 'content');
		this.role('content');
	}
}

export type ModalOverlayElements = BondElements & {
	root?: HTMLElement;
	content?: HTMLElement;
	title?: HTMLElement;
	description?: HTMLElement;
};

// Dialog/Drawer author via defineBond + modalCapabilities() (docs/extensibility-vision.md §13);
// only the shared modal atoms (root + content) and element shape remain here.
