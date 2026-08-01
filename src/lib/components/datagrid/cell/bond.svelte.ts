import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '@ixirjs/ui/shared';
import { specializeDefinition } from '$ixirjs/ui/shared/authoring/metadata';
import { DataGridBond, type IDataGrid } from '$ixirjs/ui/components/datagrid/bond.svelte';
import { rowColumnCellLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridCellBondProps<T = unknown> = BondStateProps & {
	data?: T;
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

const DataGridCellBondDefinition = defineBond({
	name: 'datagrid-cell',
	base: DataGridCellBondBase,
	atoms: { root: DataGridCellRootAtom }
});

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridCellBond<T = unknown> = BondOf<typeof DataGridCellBondDefinition> & {
	readonly __props?: DataGridCellBondProps<T>;
	readonly datagrid: IDataGrid<T> | undefined;
};

// Generic-constructor facade over the non-generic impl.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

// TS cannot retain a class value's type parameter through `typeof DataGridCellBondDefinition`; this
// minimal static facade preserves generic construction and context lookup ergonomics.
interface DataGridCellBondGenericFacade {
	new <T = unknown>(props: DataGridCellBondProps<T>): DataGridCellBond<T>;
	get<T = unknown>(): DataGridCellBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): DataGridCellBond<T>;
	optional<T = unknown>(): DataGridCellBond<T> | undefined;
	required<T = unknown>(message?: string): DataGridCellBond<T>;
	set<T = unknown>(bond: DataGridCellBond<T>): DataGridCellBond<T>;
	create<T = unknown>(props: DataGridCellBondProps<T>): DataGridCellBond<T>;
}

// Replace only generic-sensitive signatures. The mapped original retains defineBond's
// untouched statics and definition phantom metadata while dropping its construct signature.
type DataGridCellBondConstructor = Omit<
	typeof DataGridCellBondDefinition,
	keyof DataGridCellBondGenericFacade
> &
	DataGridCellBondGenericFacade;

export const DataGridCellBond = specializeDefinition<DataGridCellBondConstructor>(
	DataGridCellBondDefinition
);
