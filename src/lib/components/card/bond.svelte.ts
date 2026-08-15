import { Atom, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { labelledControl } from '$ixirjs/ui/shared/capability/models/relationship.svelte';

export type CardBondProps = BondStateProps & {
	disabled?: boolean;
	clickable?: boolean;
};

class CardRootAtom extends Atom<CardBondBase> {
	constructor(bond: CardBondBase | undefined) {
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

class CardBondBase extends Bond<CardBondProps> {
	constructor(props: CardBondProps, name = 'card') {
		super(props, name);
		this.deferSetupFreeCapability(labelledControl);
	}
}

export const CardBond = defineBond({
	name: 'card',
	base: CardBondBase,
	atoms: {
		root: { atom: CardRootAtom, role: 'control' },
		// Presentation-free slots: `defineBond` synthesizes the Atom from the slot name and `name`,
		// which is what a bondless `<Card.Title>` (every card part resolves its bond optionally)
		// derives its kind and preset key from.
		header: {},
		title: { role: 'label' },
		subtitle: {},
		description: { role: 'description' },
		content: {},
		media: {},
		actions: {},
		footer: {}
	}
});

export type CardBond = BondOf<typeof CardBond>;
