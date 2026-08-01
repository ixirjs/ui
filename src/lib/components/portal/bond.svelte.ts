import {
	Bond,
	BondState,
	BondAtom,
	type BondElements,
	type BondStateProps
} from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';

export type PortalStateProps = BondStateProps & {
	id: string;
};

export type PortalElements = BondElements & {
	root?: HTMLElement;
	inner?: HTMLElement;
};

// Bond shape the portal atoms type `this.bond` against — breaks the atom↔bond cycle.
type PortalBondView = ViewOf<PortalState>;

export class PortalRootAtom extends BondAtom<PortalBondView, HTMLElement> {
	constructor(bond: PortalBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		return {
			...super.attrs,
			id: this.bond.id
		};
	}
}

export class PortalInnerAtom extends BondAtom<PortalBondView, HTMLElement> {
	constructor(bond: PortalBondView) {
		super(bond, 'inner');
	}
}

class PortalBondBase extends Bond<PortalStateProps, PortalState> {
	// The teleport sink and the floating-ui boundary are the same element: the Inner once mounted,
	// else the Outer. A getter, not a $derived memo, so synchronous readers see a fresh value.
	get boundaryElement(): HTMLElement | undefined {
		return this.element<HTMLElement>('inner') ?? this.element<HTMLElement>('root');
	}
}

export const PortalBond = defineBond<
	{ root: typeof PortalRootAtom; inner: typeof PortalInnerAtom },
	PortalState,
	typeof PortalBondBase
>({
	name: 'portal',
	base: PortalBondBase,
	atoms: { root: PortalRootAtom, inner: PortalInnerAtom }
});

export type PortalBond = BondOf<typeof PortalBond>;

export class PortalState extends BondState<PortalStateProps> {}
