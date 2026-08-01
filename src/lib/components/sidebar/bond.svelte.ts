import { Atom } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import { OverlayBond } from '$svelte-atoms/core/components/portal/host';
import type { DisclosureStateProps } from '$svelte-atoms/core/shared/capability/models/disclosure-state.svelte';

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
		const props = this.bond.state.props;
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
	constructor(props: SidebarBondProps, name = 'sidebar') {
		super(props, name);
	}
}

// Non-generic bond.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const SidebarBondImpl = defineBond<
	{ content: typeof SidebarContentAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof SidebarBondBase
>({
	name: 'sidebar',
	base: SidebarBondBase,
	atoms: { content: SidebarContentAtom }
});

export type SidebarBond = BondOf<typeof SidebarBondImpl>;

interface SidebarBondConstructor {
	new (props: SidebarBondProps): SidebarBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof SidebarBondImpl)['spec'];
	get(): SidebarBond | undefined;
	getOrThrow(message?: string): SidebarBond;
	set(bond: SidebarBond): SidebarBond;
	create(props: SidebarBondProps): SidebarBond;
}

export const SidebarBond = SidebarBondImpl as unknown as SidebarBondConstructor;
