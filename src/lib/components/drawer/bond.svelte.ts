import { getElementId } from '$ixirjs/ui/utils/dom.svelte';
import { Atom, defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	ModalRootAtom,
	ModalContentAtom,
	OverlayBond,
	ESCAPE,
	escapePolicy,
	modalCapabilities,
	TRIGGER,
	type ModalOverlayElements,
	type OverlayStateProps,
	type OverlayView
} from '$ixirjs/ui/components/overlay';
import type { StateChangeContext } from '$ixirjs/ui/types';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DrawerBondProps<T extends Record<string, unknown> = Record<string, unknown>> =
	OverlayStateProps & {
		disabled: boolean;
		side?: 'left' | 'right' | 'top' | 'bottom';
		extend?: T;
	};

export type DrawerBondElements = ModalOverlayElements & {
	drawer?: HTMLElement;
	header?: HTMLElement;
	body?: HTMLElement;
	footer?: HTMLElement;
	backdrop?: HTMLElement;
};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class DrawerBondBase extends OverlayBond<DrawerBondProps> {
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;

	constructor(props: DrawerBondProps, name = 'drawer') {
		super(props, name);
	}

	stageOpenChange(context: Pick<StateChangeContext, 'event' | 'reason'>): void {
		this.#openChangeContext = context;
		queueMicrotask(() => {
			if (this.#openChangeContext === context) this.#openChangeContext = undefined;
		});
	}

	takeOpenChangeContext(): Pick<StateChangeContext, 'event' | 'reason'> {
		const context = this.#openChangeContext ?? {};
		this.#openChangeContext = undefined;
		return context;
	}
}

// Narrow view type breaks the atom↔bond cycle through defineBond.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DrawerBondView = OverlayView & DrawerBondBase;

// Overlays aria-hidden and data-active on the modal ARIA contract.

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class DrawerRootAtom extends ModalRootAtom<DrawerBondView> {
	override get attrs() {
		const isOpen = this.requireBond().isOpen;
		const isDisabled = this.requireBond().isDisabled;
		const isActive = isOpen && !isDisabled;
		return {
			...super.attrs,
			'aria-hidden': !isActive,
			'data-active': isActive
		};
	}
}

export class DrawerContentAtom extends ModalContentAtom<DrawerBondView> {
	override get attrs() {
		return {
			...super.attrs,
			role: 'document'
		};
	}
}

export class DrawerHeaderAtom extends Atom<DrawerBondView> {
	constructor(bond: DrawerBondView) {
		super(bond, 'header');
	}
	override get attrs() {
		return {
			...super.attrs,
			role: 'banner'
		};
	}
}

export class DrawerTitleAtom extends Atom<DrawerBondView> {
	constructor(bond: DrawerBondView) {
		super(bond, 'title');
	}
	override get attrs() {
		return {
			...super.attrs,
			id: getElementId(this.requireBond().id, 'drawer-title'),
			role: 'heading',
			'aria-level': 2
		};
	}
}

export class DrawerDescriptionAtom extends Atom<DrawerBondView> {
	constructor(bond: DrawerBondView) {
		super(bond, 'description');
	}
	override get attrs() {
		return {
			...super.attrs,
			id: getElementId(this.requireBond().id, 'drawer-description')
		};
	}
}

export class DrawerBodyAtom extends Atom<DrawerBondView> {
	constructor(bond: DrawerBondView) {
		super(bond, 'body');
	}
	override get attrs() {
		return {
			...super.attrs,
			role: 'region'
		};
	}
}

export class DrawerFooterAtom extends Atom<DrawerBondView> {
	constructor(bond: DrawerBondView) {
		super(bond, 'footer');
	}
	override get attrs() {
		return {
			...super.attrs,
			role: 'contentinfo'
		};
	}
}

// Clicking the backdrop closes the drawer (gated by disabled).
export class DrawerBackdropAtom extends Atom<DrawerBondView> {
	constructor(bond: DrawerBondView) {
		super(bond, 'backdrop');
		this.role('backdrop');
	}
	override get attrs() {
		return {
			...super.attrs,
			role: 'presentation',
			'aria-hidden': true
		};
	}
	override get handlers() {
		return {
			...super.handlers,
			onclick: (event: MouseEvent) => {
				this.requireBond().stageOpenChange({ event, reason: 'backdrop-press' });
			}
		};
	}
}

// Controlled slide-out modal (no trigger — use PopoverDialog for that); modalCapabilities() minus trigger.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const DrawerBondDefinition = defineBond({
	name: 'drawer',
	base: DrawerBondBase,
	capabilities: () => [
		...modalCapabilities().filter(
			(capability) => capability.slot !== TRIGGER && capability.slot !== ESCAPE
		),
		escapePolicy((bond, event) => {
			const drawer = bond as DrawerBondBase;
			drawer.stageOpenChange({ event, reason: 'escape' });
			drawer.close();
		})
	],
	atoms: {
		root: { atom: DrawerRootAtom, selfLayer: true },
		content: DrawerContentAtom,
		header: { atom: DrawerHeaderAtom, cardinality: 'many' },
		title: DrawerTitleAtom,
		description: DrawerDescriptionAtom,
		body: { atom: DrawerBodyAtom, cardinality: 'many' },
		footer: { atom: DrawerFooterAtom, cardinality: 'many' },
		backdrop: DrawerBackdropAtom
	}
});

export const DrawerBond = DrawerBondDefinition;
export type DrawerBond = BondOf<typeof DrawerBond>;
