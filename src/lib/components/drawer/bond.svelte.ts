import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import { BondAtom, defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	ModalRootAtom,
	ModalContentAtom,
	OverlayState,
	OverlayBond,
	modalCapabilities,
	TRIGGER,
	type ModalOverlayElements,
	type OverlayStateProps,
	type OverlayView
} from '$svelte-atoms/core/components/overlay';

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

// Narrow view type breaks the atom↔bond cycle through defineBond (§13).
type DrawerBondView = OverlayView & { state: DrawerBondState };

// Overlays aria-hidden and data-active on the modal ARIA contract.
export class DrawerRootAtom extends ModalRootAtom<DrawerBondView> {
	override get attrs() {
		const isOpen = this.bond.state.isOpen;
		const isDisabled = this.bond.state.isDisabled;
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

export class DrawerHeaderAtom extends BondAtom<DrawerBondView> {
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

export class DrawerTitleAtom extends BondAtom<DrawerBondView> {
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

export class DrawerDescriptionAtom extends BondAtom<DrawerBondView> {
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

export class DrawerBodyAtom extends BondAtom<DrawerBondView> {
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

export class DrawerFooterAtom extends BondAtom<DrawerBondView> {
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
export class DrawerBackdropAtom extends BondAtom<DrawerBondView> {
	constructor(bond: DrawerBondView) {
		super(bond, 'backdrop');
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
			onclick: () => {
				if (!this.bond.state.isDisabled) this.bond.state.close();
			}
		};
	}
}

export class DrawerBondState<
	Props extends DrawerBondProps = DrawerBondProps
> extends OverlayState<Props> {}

// Controlled slide-out modal (no trigger — use PopoverDialog for that); modalCapabilities() minus trigger.
export const DrawerBond = defineBond<
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
	DrawerBondState,
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

export type DrawerBond = BondOf<typeof DrawerBond>;
