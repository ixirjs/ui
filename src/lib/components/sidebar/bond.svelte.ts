import { Atom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { OverlayBond } from '$ixirjs/ui/components/overlay';
import type { DisclosureStateProps } from '$ixirjs/ui/shared/capability/models/disclosure-state.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type SidebarBondProps<T extends Record<string, unknown> = Record<string, unknown>> =
	DisclosureStateProps & {
		reversed: boolean;
		extend: T;
	};

export type SidebarElements = {
	root: HTMLElement;
	content: HTMLElement;
};

// Bond shape the atoms type `this.bond` against — breaks the atom↔bond cycle.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type SidebarBondView = SidebarBondBase;

export class SidebarContentAtom extends Atom<SidebarBondView, HTMLElement> {
	constructor(bond: SidebarBondView) {
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

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class SidebarBondBase extends OverlayBond<SidebarBondProps> {
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;

	constructor(props: SidebarBondProps, name = 'sidebar') {
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

// Non-generic bond.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const SidebarBond = defineBond({
	name: 'sidebar',
	base: SidebarBondBase,
	atoms: { content: SidebarContentAtom }
});

export type SidebarBond = BondOf<typeof SidebarBond>;
