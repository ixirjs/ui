import { Atom, type BondElements } from '$ixirjs/ui/shared/bond';
import type { OverlayView } from './types';
import {
	overlayIsDisabled,
	overlayIsModal,
	overlayIsOpen,
	overlayNode
} from './policies/overlay-view';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$ixirjs/ui/shared/capability';

const MODAL_ROOT = sharedCapabilityKey<void>({ owner: '@ixirjs/modal', name: 'root', version: 1 });

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
			projects: ['root'],
			docs: 'Shared modal dialog ARIA, inert, and open-state projection.'
		},
		attach: {
			attrs: (_node, bond) => {
				if (!bond) return {};
				const titleId = overlayNode(bond, 'title')?.id;
				const descriptionId = overlayNode(bond, 'description')?.id;
				const hasTitle = titleId !== undefined;
				const hasDescription = descriptionId !== undefined;
				const isOpen = overlayIsOpen(bond);
				const isDisabled = overlayIsDisabled(bond);
				const modal = overlayIsModal(bond);
				const isActive = isOpen && !isDisabled;

				return {
					role: 'dialog',
					'aria-modal': modal ? true : undefined,
					'aria-labelledby': hasTitle ? titleId : undefined,
					'aria-describedby': hasDescription ? descriptionId : undefined,
					inert: modal && !isActive ? '' : undefined,
					tabindex: -1,
					'data-open': isOpen,
					'data-state': isOpen ? 'open' : 'closed'
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
