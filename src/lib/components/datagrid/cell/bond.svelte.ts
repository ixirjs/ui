import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import { DataGridBond, type IDataGrid } from '../bond.svelte';
import { rowColumnCellLink } from '$svelte-atoms/core/shared/capability/models/relationship.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridCellBondProps<T = unknown> = BondStateProps & {
	data?: T;
};

export type DataGridCellElements = {
	root: HTMLElement;
};

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DataGridCellBondView = DataGridCellBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const DataGridCellRootAtom = defineAtom<DataGridCellBondView>('root', (atom) => {
	atom.role('cell');
});
export type DataGridCellRootAtom = InstanceType<typeof DataGridCellRootAtom>;

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class DataGridCellBondBase<T = unknown> extends Bond<DataGridCellBondProps<T>> {
	readonly #datagrid = DataGridBond.get() as DataGridBond<T> | undefined;

	constructor(props: DataGridCellBondProps<T>) {
		super(props, 'datagrid-cell');
		this.capability(rowColumnCellLink());
	}

	get datagrid(): IDataGrid<T> | undefined {
		return this.#datagrid;
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const DataGridCellBondImpl = defineBond<
	{ root: typeof DataGridCellRootAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof DataGridCellBondBase
>({
	name: 'datagrid-cell',
	base: DataGridCellBondBase,
	atoms: { root: DataGridCellRootAtom }
});

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridCellBond<T = unknown> = BondOf<typeof DataGridCellBondImpl> & {
	readonly __props?: DataGridCellBondProps<T>;
	readonly datagrid: IDataGrid<T> | undefined;
};

// Generic-constructor facade over the non-generic impl.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

interface DataGridCellBondConstructor {
	new <T = unknown>(props: DataGridCellBondProps<T>): DataGridCellBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): DataGridCellBond<T> | undefined;
	set<T = unknown>(bond: DataGridCellBond<T>): DataGridCellBond<T>;
	create<T = unknown>(props: DataGridCellBondProps<T>): DataGridCellBond<T>;
}

export const DataGridCellBond = DataGridCellBondImpl as unknown as DataGridCellBondConstructor;

// Backward-compatible aliases for existing imports.
export type DataGridTdBondProps<T = unknown> = DataGridCellBondProps<T>;
export type DataGridTdElements = DataGridCellElements;
export { DataGridCellBond as DataGridTdBond };
