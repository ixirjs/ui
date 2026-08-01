import { Atom, type BondElements } from '$svelte-atoms/core/shared/bond';
import type { OverlayView } from './types';
import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import { overlayIsDisabled, overlayIsOpen } from './policies/overlay-view';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';

const MODAL_ROOT = sharedCapabilityKey<void>('@svelte-atoms/modal:root');

// Root atom for modal overlays. Wires the ARIA dialog contract; .role('surface') folds in escape + focus handlers.
export class ModalRootAtom<B extends OverlayView = OverlayView> extends Atom<B, HTMLElement> {
	constructor(bond: B) {
		super(bond, 'root');
		this.role('surface');
		this.capability(modalRootPresentation());
	}

	// No hand-written handlers: focus-trap and escape onkeydown come from .role('surface'), chained via composeHandlers.
}

function modalRootPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: MODAL_ROOT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['root'],
			docs: 'Shared modal dialog ARIA, inert, and open-state projection.'
		},
		behavior: {
			attrs: (_node, bond) => {
				if (!bond) return {};
				const titleId = getElementId(bond.id, `${bond.name}-title`);
				const descriptionId = getElementId(bond.id, `${bond.name}-description`);
				const hasTitle = !!bond.elements.title;
				const hasDescription = !!bond.elements.description;
				const isOpen = overlayIsOpen(bond);
				const isDisabled = overlayIsDisabled(bond);
				const isActive = isOpen && !isDisabled;

				return {
					role: 'dialog',
					'aria-modal': true,
					'aria-labelledby': hasTitle ? titleId : undefined,
					'aria-describedby': hasDescription ? descriptionId : undefined,
					inert: !isActive ? '' : undefined,
					tabindex: -1,
					'data-open': isOpen
				};
			}
		}
	});
}

// Content atom for modal overlays. .role('content') folds in the focus capability's focus-first-on-open onmount.
export class ModalContentAtom<B extends OverlayView = OverlayView> extends Atom<B, HTMLElement> {
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

// Dialog/Drawer author via defineBond + modalCapabilities();
// only the shared modal atoms (root + content) and element shape remain here.
