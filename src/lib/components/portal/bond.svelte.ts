import {
	Atom,
	Bond,
	defineAtom,
	type BondElements,
	type BondStateProps
} from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type PortalBondProps = BondStateProps & {
	id: string;
};

export type PortalStateProps = PortalBondProps;

export type PortalElements = BondElements & {
	root?: HTMLElement;
	inner?: HTMLElement;
};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class PortalBondBase<Props extends PortalBondProps = PortalBondProps> extends Bond<Props> {
	constructor(props: Props) {
		super(props, 'portal');
	}

	// The teleport sink and the floating-ui boundary are the same element: the Inner once mounted,
	// else the Outer.
	get boundaryElement(): HTMLElement | undefined {
		return (
			(this.node('inner')?.element as HTMLElement | undefined) ??
			(this.node('root')?.element as HTMLElement | undefined)
		);
	}
}

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type PortalBondView = PortalBondBase<PortalBondProps>;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class PortalRootAtom extends Atom<PortalBondView, HTMLElement> {
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

export const PortalInnerAtom = defineAtom<PortalBondView, HTMLElement>('inner');
export type PortalInnerAtom = InstanceType<typeof PortalInnerAtom>;

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const PortalBondImpl = defineBond<
	{ root: typeof PortalRootAtom; inner: typeof PortalInnerAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof PortalBondBase
>({
	name: 'portal',
	base: PortalBondBase,
	atoms: { root: PortalRootAtom, inner: PortalInnerAtom }
});

export type PortalBond = BondOf<typeof PortalBondImpl>;

interface PortalBondConstructor {
	new (props: PortalBondProps): PortalBond;
	readonly CONTEXT_KEY: string;
	readonly CONTEXT_KEYS?: readonly string[];
	readonly spec: (typeof PortalBondImpl)['spec'];
	get(): PortalBond | undefined;
	getOrThrow(message?: string): PortalBond;
	set(bond: PortalBond): PortalBond;
	create(props: PortalBondProps): PortalBond;
}

export const PortalBond = PortalBondImpl as unknown as PortalBondConstructor;
