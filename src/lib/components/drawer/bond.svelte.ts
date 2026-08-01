import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import { Atom, defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	ModalRootAtom,
	ModalContentAtom,
	OverlayBond,
	modalCapabilities,
	TRIGGER,
	type ModalOverlayElements,
	type OverlayStateProps,
	type OverlayView
} from '$svelte-atoms/core/components/portal/host';

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

// Narrow view type breaks the atom↔bond cycle through defineBond.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DrawerBondView = OverlayView & OverlayBond<DrawerBondProps>;

// Overlays aria-hidden and data-active on the modal ARIA contract.

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class DrawerRootAtom extends ModalRootAtom<DrawerBondView> {
	override get attrs() {
		const isOpen = this.bond.isOpen;
		const isDisabled = this.bond.isDisabled;
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
			id: getElementId(this.bond.id, 'drawer-title'),
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
			id: getElementId(this.bond.id, 'drawer-description')
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
}

// Controlled slide-out modal (no trigger — use PopoverDialog for that); modalCapabilities() minus trigger.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const DrawerBondImpl = defineBond<
	{
		root: typeof DrawerRootAtom;
		content: typeof DrawerContentAtom;
		header: typeof DrawerHeaderAtom;
		title: typeof DrawerTitleAtom;
		description: typeof DrawerDescriptionAtom;
		body: typeof DrawerBodyAtom;
		footer: typeof DrawerFooterAtom;
		backdrop: typeof DrawerBackdropAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof OverlayBond
>({
	name: 'drawer',
	base: OverlayBond,
	capabilities: () => modalCapabilities().filter((c) => c.slot !== TRIGGER),
	atoms: {
		root: DrawerRootAtom,
		content: DrawerContentAtom,
		header: DrawerHeaderAtom,
		title: DrawerTitleAtom,
		description: DrawerDescriptionAtom,
		body: DrawerBodyAtom,
		footer: DrawerFooterAtom,
		backdrop: DrawerBackdropAtom
	}
});

export type DrawerBond = BondOf<typeof DrawerBondImpl> & OverlayBond<DrawerBondProps>;

interface DrawerBondConstructor {
	new (props: DrawerBondProps): DrawerBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof DrawerBondImpl)['spec'];
	get(): DrawerBond | undefined;
	getOrThrow(message?: string): DrawerBond;
	set(bond: DrawerBond): DrawerBond;
	create(props: DrawerBondProps): DrawerBond;
}

export const DrawerBond = DrawerBondImpl as unknown as DrawerBondConstructor;
