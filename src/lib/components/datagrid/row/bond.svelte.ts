import { Bond, BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import { DataGridBond, type IDataGrid } from '../bond.svelte';
import { getDatagridHeaderContext } from '../context';

export type DataGridRowBondProps<T = unknown> = BondStateProps & {
	value?: string;
	data?: T;
};

export type DataGridRowBondElements = {
	root: HTMLElement;
};

// Bond shape the row atoms type this.bond against — breaks the atom↔bond cycle.
type DataGridRowBondView = ViewOf<DataGridRowBondState>;

export class DataGridRowRootAtom extends BondAtom<DataGridRowBondView> {
	constructor(bond: DataGridRowBondView) {
		super(bond, 'root');
		// Project selection a11y (role:'item') onto data rows only — header rows are not selectable.
		if (!bond.state.isHeader) this.role('item', bond.state.id);
	}

	override get attrs() {
		// aria-selected + data-selected come from the datagrid's selection capability (role:'item').
		return {
			...super.attrs,
			'data-kind': 'datagrid-row',
			'data-header': this.bond.state.isHeader ? 'true' : undefined
		};
	}
}

// Hand-written base for DataGridRowBond — captures parent datagrid (throws if absent) and provides mount/preset.
class DataGridRowBondBase extends Bond<DataGridRowBondProps, DataGridRowBondState> {
	readonly #parent: IDataGrid;

	constructor(state: DataGridRowBondState) {
		super(state, 'datagrid-row');
		const datagrid = DataGridBond.get() as DataGridBond | undefined;
		if (!datagrid) throw new Error('DataGridRowBond must be used within a DataGridBond context.');
		this.#parent = datagrid.state;
	}

	get datagrid(): IDataGrid {
		return this.#parent;
	}

	// Preset namespace is datagrid.row (not the hyphenated DOM name datagrid-row).
	override get preset(): string {
		return 'datagrid.row';
	}

	mount(): () => void {
		return this.#parent.mountRow(this.state.id, this as unknown as DataGridRowBond);
	}
}

// DataGridRowBond via defineBond over DataGridRowBondBase; T carried by state/datagrid via generic facade.
const DataGridRowBondImpl = defineBond<
	{ root: typeof DataGridRowRootAtom },
	DataGridRowBondState,
	typeof DataGridRowBondBase
>({
	name: 'datagrid-row',
	base: DataGridRowBondBase,
	atoms: { root: DataGridRowRootAtom }
});

// Generic instance type — intersect to preserve Bond brand; narrows state/datagrid to carry T.
export type DataGridRowBond<
	T = unknown,
	Props extends DataGridRowBondProps<T> = DataGridRowBondProps<T>,
	State extends DataGridRowBondState<T, Props> = DataGridRowBondState<T, Props>
> = BondOf<typeof DataGridRowBondImpl> & {
	readonly state: State;
	readonly datagrid: IDataGrid<T>;
};

// Generic-constructor facade over the non-generic impl.
interface DataGridRowBondConstructor {
	new <T = unknown>(state: DataGridRowBondState<T>): DataGridRowBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): DataGridRowBond<T> | undefined;
	set<T = unknown>(bond: DataGridRowBond<T>): DataGridRowBond<T>;
}

export const DataGridRowBond = DataGridRowBondImpl as unknown as DataGridRowBondConstructor;

export class DataGridRowBondState<
	T = unknown,
	Props extends DataGridRowBondProps<T> = DataGridRowBondProps<T>
> extends BondState<Props> {
	readonly #parent: IDataGrid<T> | undefined = (
		DataGridBond.get() as DataGridBond<T> | undefined
	)?.state;
	// Captured at construction; read live via getter so header-ness tracks the context's reactive flag.
	readonly #headerContext = getDatagridHeaderContext();

	constructor(props: Props) {
		super(props);
		// Bridge datagrid's selection capability onto this row so aria-selected/data-selected are projected.
		const selection = this.#parent?.selectionCapability();
		if (selection) this.capability(selection);
	}

	get id(): string {
		return this.props.value ?? super.id;
	}

	get isSelected(): boolean {
		return this.#parent?.isSelected(this.id) ?? false;
	}

	get isHeader(): boolean {
		return this.#headerContext?.isHeader ?? false;
	}

	get datagrid(): IDataGrid<T> | undefined {
		return this.#parent;
	}

	select(): void {
		this.#parent?.select([this.id]);
	}

	unselect(): void {
		this.#parent?.unselect([this.id]);
	}
}

// Backward-compatible aliases for existing imports.
export type DataGridTrBondProps<T = unknown> = DataGridRowBondProps<T>;
export type DataGridTrBondElements = DataGridRowBondElements;
export { DataGridRowBond as DataGridTrBond, DataGridRowBondState as DataGridTrBondState };
