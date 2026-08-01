import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import { BondAtom, defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	ModalRootAtom,
	ModalContentAtom,
	OverlayState,
	modalCapabilities,
	type ModalOverlayElements,
	type OverlayStateProps,
	type OverlayView
} from '$svelte-atoms/core/shared/overlay';

export type DialogBondProps = OverlayStateProps & {
	disabled: boolean;
	configs?: {
		popovers?: {
			strategy: 'fixed' | 'absolute';
		};
	};
};

export type DialogBondElements = ModalOverlayElements & {
	header?: HTMLElement;
	body?: HTMLElement;
	footer?: HTMLElement;
};

// Narrow view type breaks the atom↔bond cycle through defineBond; no base class — overlay behaviour from capabilities (§13).
type DialogBondView = OverlayView & { state: DialogBondState };

// Adds role="document" on top of ModalContentAtom's focus-on-mount behaviour.
export class DialogContentAtom extends ModalContentAtom<DialogBondView> {
	override get attrs() {
		return {
			...super.attrs,
			role: 'document'
		};
	}
}

export class DialogHeaderAtom extends BondAtom<DialogBondView> {
	constructor(bond: DialogBondView) {
		super(bond, 'header');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'banner'
		};
	}
}

export class DialogTitleAtom extends BondAtom<DialogBondView> {
	constructor(bond: DialogBondView) {
		super(bond, 'title');
	}

	override get attrs() {
		return {
			...super.attrs,
			id: getElementId(this.bond.id, 'dialog-title'),
			role: 'heading',
			'aria-level': 2
		};
	}
}

export class DialogDescriptionAtom extends BondAtom<DialogBondView> {
	constructor(bond: DialogBondView) {
		super(bond, 'description');
	}

	override get attrs() {
		return {
			...super.attrs,
			id: getElementId(this.bond.id, 'dialog-description')
		};
	}
}

export class DialogBodyAtom extends BondAtom<DialogBondView> {
	constructor(bond: DialogBondView) {
		super(bond, 'body');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'region',
			'aria-live': 'polite'
		};
	}
}

export class DialogFooterAtom extends BondAtom<DialogBondView> {
	constructor(bond: DialogBondView) {
		super(bond, 'footer');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'contentinfo'
		};
	}
}

export class DialogBondState<
	Props extends DialogBondProps = DialogBondProps
> extends OverlayState<Props> {}

// Controlled modal disclosure (no trigger — use PopoverDialog for that). Focus-trap + escape from modalCapabilities(); trigger capability filtered out.
export const DialogBond = defineBond<
	{
		root: typeof ModalRootAtom;
		content: typeof DialogContentAtom;
		header: typeof DialogHeaderAtom;
		title: typeof DialogTitleAtom;
		description: typeof DialogDescriptionAtom;
		body: typeof DialogBodyAtom;
		footer: typeof DialogFooterAtom;
	},
	DialogBondState
>({
	name: 'dialog',
	capabilities: () => modalCapabilities().filter((c) => c.slot !== 'trigger'),
	atoms: {
		root: ModalRootAtom,
		content: DialogContentAtom,
		header: DialogHeaderAtom,
		title: DialogTitleAtom,
		description: DialogDescriptionAtom,
		body: DialogBodyAtom,
		footer: DialogFooterAtom
	}
});

// Instance type of the dialog bond — paired with the const above (value + type).
export type DialogBond = BondOf<typeof DialogBond>;
