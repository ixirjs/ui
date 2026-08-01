import { BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import { DataGridBond } from '../bond.svelte';

export type DataGridCellBondProps<T = unknown> = BondStateProps & {
	data?: T;
};

export type DataGridCellElements = {
	root: HTMLElement;
};

// Bond shape the cell atoms type this.bond against — breaks the atom↔bond cycle.
type DataGridCellBondView = ViewOf<DataGridCellBondState>;

export class DataGridCellRootAtom extends BondAtom<DataGridCellBondView> {
	constructor(bond: DataGridCellBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		return {
			...super.attrs,
			'data-kind': 'datagrid-cell'
		};
	}
}

// DataGridCellBond via defineBond; T is a runtime phantom on state — generic facade pattern.
const DataGridCellBondImpl = defineBond<
	{ root: typeof DataGridCellRootAtom },
	DataGridCellBondState
>({
	name: 'datagrid-cell',
	atoms: { root: DataGridCellRootAtom }
});

// Generic instance type — intersect to preserve Bond brand; narrows state to carry T.
export type DataGridCellBond<T = unknown> = BondOf<typeof DataGridCellBondImpl> & {
	readonly state: DataGridCellBondState<T>;
};

// Generic-constructor facade over the non-generic impl.
interface DataGridCellBondConstructor {
	new <T = unknown>(state: DataGridCellBondState<T>): DataGridCellBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): DataGridCellBond<T> | undefined;
	set<T = unknown>(bond: DataGridCellBond<T>): DataGridCellBond<T>;
}

export const DataGridCellBond = DataGridCellBondImpl as unknown as DataGridCellBondConstructor;

export class DataGridCellBondState<T = unknown> extends BondState<DataGridCellBondProps<T>> {
	readonly #datagrid = DataGridBond.get() as DataGridBond<T> | undefined;

	constructor(props: DataGridCellBondProps<T>) {
		super(props);
	}

	get datagrid() {
		return this.#datagrid?.state;
	}
}

// Backward-compatible aliases for existing imports.
export type DataGridTdBondProps<T = unknown> = DataGridCellBondProps<T>;
export type DataGridTdElements = DataGridCellElements;
export { DataGridCellBond as DataGridTdBond, DataGridCellBondState as DataGridTdBondState };
