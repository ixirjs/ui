import {
	DropdownMenuBond,
	DropdownMenuBondBase,
	type DropdownMenuBondProps
} from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { manualTrigger } from '$ixirjs/ui/components/overlay';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type ContextMenuBondProps = DropdownMenuBondProps;

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class ContextMenuBondBase<
	Props extends ContextMenuBondProps = ContextMenuBondProps
> extends DropdownMenuBondBase<Props> {
	constructor(props: Props) {
		super(props, 'context-menu');
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

// Inlined deliberately: `defineBond<const S>` infers `parts` as a tuple only from a literal
// argument. Hoisting the spec to its own `const` widened it to an array, which made `AtomsOf`
// resolve every inherited slot to `never` — `usePart(ContextMenuBond, 'virtual-trigger')` could not
// type-check even though the runtime spec merge had always provided it.
export const ContextMenuBond = defineBond({
	parts: [DropdownMenuBond],
	name: 'context-menu',
	base: ContextMenuBondBase,
	atoms: {},
	capabilities: () => [manualTrigger({ ariaHasPopup: 'menu' })]
});

export type ContextMenuBond = BondOf<typeof ContextMenuBond>;
