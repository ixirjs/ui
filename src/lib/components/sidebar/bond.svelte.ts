import { Atom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { OverlayBond } from '$ixirjs/ui/components/overlay';
import type { DisclosureStateProps } from '$ixirjs/ui/shared/capability/models/disclosure-state.svelte';

export type SidebarBondProps<T extends Record<string, unknown> = Record<string, unknown>> =
	DisclosureStateProps & {
		reversed: boolean;
		extend: T;
	};

// Bond shape the atoms type `this.bond` against — breaks the atom↔bond cycle.

class SidebarContentAtom extends Atom<SidebarBondBase, HTMLElement> {
	constructor(bond: SidebarBondBase) {
		super(bond, 'content');
	}
	override get attrs() {
		const props = this.requireBond().props;
		const isOpen = props?.open ?? false;
		const isDisabled = props?.disabled ?? false;

		return {
			...super.attrs,
			'aria-expanded': isOpen,
			'aria-disabled': isDisabled
		};
	}
}

class SidebarBondBase extends OverlayBond<SidebarBondProps> {
	constructor(props: SidebarBondProps, name = 'sidebar') {
		super(props, name);
	}
}

// Non-generic bond.

export const SidebarBond = defineBond({
	name: 'sidebar',
	base: SidebarBondBase,
	atoms: { content: SidebarContentAtom }
});

export type SidebarBond = BondOf<typeof SidebarBond>;
