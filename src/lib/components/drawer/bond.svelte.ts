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
	type OverlayStateProps,
	type OverlayView
} from '$ixirjs/ui/components/overlay';

export type DrawerBondProps<T extends Record<string, unknown> = Record<string, unknown>> =
	OverlayStateProps & {
		disabled: boolean;
		side?: 'left' | 'right' | 'top' | 'bottom';
		extend?: T;
	};

export class DrawerBondBase extends OverlayBond<DrawerBondProps> {
	constructor(props: DrawerBondProps, name = 'drawer') {
		super(props, name);
	}
}

// Narrow view type breaks the atom↔bond cycle through defineBond.

type DrawerBondView = OverlayView & DrawerBondBase;

// Overlays aria-hidden and data-active on the modal ARIA contract.

class DrawerRootAtom extends ModalRootAtom<DrawerBondView> {
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

class DrawerContentAtom extends ModalContentAtom<DrawerBondView> {
	override get attrs() {
		return {
			...super.attrs,
			role: 'document'
		};
	}
}

class DrawerHeaderAtom extends Atom<DrawerBondView> {
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

class DrawerTitleAtom extends Atom<DrawerBondView> {
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

class DrawerDescriptionAtom extends Atom<DrawerBondView> {
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

class DrawerBodyAtom extends Atom<DrawerBondView> {
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

class DrawerFooterAtom extends Atom<DrawerBondView> {
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
		root: { atom: DrawerRootAtom },
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
