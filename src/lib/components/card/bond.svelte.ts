import { Atom, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { labelledControl } from '$ixirjs/ui/shared/capability/models/relationship.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type CardBondProps = BondStateProps & {
	disabled?: boolean;
	clickable?: boolean;
};

export type CardBondElements = {
	root: HTMLElement;
	header: HTMLElement;
	title: HTMLElement;
	subtitle: HTMLElement;
	description: HTMLElement;
	content: HTMLElement;
	media: HTMLElement;
	actions: HTMLElement;
	footer: HTMLElement;
};

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type CardBondView = CardBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class CardRootAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'root', { namespace: 'card' });
	}

	override get attrs() {
		const isClickable = this.bond?.props.clickable ?? false;
		const isDisabled = this.bond?.props.disabled ?? false;

		return {
			...super.attrs,
			role: isClickable ? 'button' : undefined,
			tabindex: isClickable && !isDisabled ? 0 : undefined,
			'aria-disabled': isDisabled
		};
	}
}

export class CardHeaderAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'header', { namespace: 'card' });
	}
}

export class CardTitleAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'title', { namespace: 'card' });
	}
}

export class CardSubtitleAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'subtitle', { namespace: 'card' });
	}
}

export class CardDescriptionAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'description', { namespace: 'card' });
	}
}

export class CardContentAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'content', { namespace: 'card' });
	}
}

export class CardMediaAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'media', { namespace: 'card' });
	}
}

export class CardActionsAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'actions', { namespace: 'card' });
	}
}

export class CardFooterAtom extends Atom<CardBondView> {
	constructor(bond: CardBondView | undefined) {
		super(bond, 'footer', { namespace: 'card' });
	}
}

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class CardBondBase extends Bond<CardBondProps> {
	constructor(props: CardBondProps, name = 'card') {
		super(props, name);
		this.capability(labelledControl());
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const CardBond = defineBond({
	name: 'card',
	base: CardBondBase,
	atoms: {
		root: { atom: CardRootAtom, role: 'control' },
		header: CardHeaderAtom,
		title: { atom: CardTitleAtom, role: 'label' },
		subtitle: CardSubtitleAtom,
		description: { atom: CardDescriptionAtom, role: 'description' },
		content: CardContentAtom,
		media: CardMediaAtom,
		actions: CardActionsAtom,
		footer: CardFooterAtom
	}
});

export type CardBond = BondOf<typeof CardBond>;
