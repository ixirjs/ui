import {
	DropdownMenuBond,
	DropdownMenuBondBase,
	type DropdownMenuBondProps
} from '$svelte-atoms/core/components/dropdown-menu/bond.svelte';
import { defineBond, type BondOf, type BondSpec } from '$svelte-atoms/core/shared';

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

const contextMenuSpec = {
	parts: [DropdownMenuBond],
	name: 'context-menu',
	base: ContextMenuBondBase,
	atoms: {}
} satisfies BondSpec<Record<never, never>, typeof ContextMenuBondBase>;

const ContextMenuBondImpl = defineBond<
	Record<never, never>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof ContextMenuBondBase
>(contextMenuSpec);

export type ContextMenuBond = BondOf<typeof ContextMenuBondImpl>;

interface ContextMenuBondConstructor {
	new (props: ContextMenuBondProps): ContextMenuBond;
	readonly CONTEXT_KEY: string;
	readonly CONTEXT_KEYS?: readonly string[];
	readonly spec: (typeof ContextMenuBondImpl)['spec'];
	get(): ContextMenuBond | undefined;
	getOrThrow(message?: string): ContextMenuBond;
	set(bond: ContextMenuBond): ContextMenuBond;
	create(props: ContextMenuBondProps): ContextMenuBond;
}

export const ContextMenuBond = ContextMenuBondImpl as unknown as ContextMenuBondConstructor;
