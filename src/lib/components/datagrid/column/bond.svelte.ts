import type { Direction, SortableType } from '$svelte-atoms/core/types';
import { DataGridBond, type IDataGrid } from '../bond.svelte';
import { Bond, BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';

export type DataGridColumnBondProps = BondStateProps & {
	id: string;
	width?: string;
	screen?: string;
	sortable?: boolean | SortableType;
	hidden?: boolean;
	direction: Direction;
};

export type DataGridColumnElements = {
	root: HTMLElement;
};

// Bond shape the column atoms type this.bond against — breaks the atom↔bond cycle.
type DataGridColumnBondView = ViewOf<DataGridColumnBondState>;

export class DataGridColumnRootAtom extends BondAtom<DataGridColumnBondView> {
	constructor(bond: DataGridColumnBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		const props = this.bond.state.props;
		return {
			...super.attrs,
			'data-kind': 'datagrid-column',
			'data-sortable': props.sortable ? 'true' : undefined,
			'data-direction': props.direction
		};
	}
}

// Hand-written base for DataGridColumnBond — captures parent datagrid and provides geometry/mount helpers.
class DataGridColumnBondBase extends Bond<DataGridColumnBondProps, DataGridColumnBondState> {
	readonly #parent: IDataGrid;

	constructor(state: DataGridColumnBondState) {
		super(state, 'datagrid-column');
		this.#parent = (DataGridBond.get() as DataGridBond).state;
	}

	// Preset namespace is datagrid.column (not the hyphenated DOM name datagrid-column).
	override get preset(): string {
		return 'datagrid.column';
	}

	get isHidden(): boolean {
		const el = this.elements.root;
		if (!(el instanceof HTMLElement)) return false;
		return Boolean(el.hidden) || getComputedStyle(el).display === 'none';
	}

	get index(): number {
		const el = this.elements.root as Element | undefined;
		return el ? Array.from(el.parentElement?.children ?? []).indexOf(el) : -1;
	}

	get text(): string {
		const el = this.elements.root;
		return el instanceof HTMLElement ? el.innerText : '';
	}

	get datagrid(): IDataGrid {
		return this.#parent;
	}

	mount(): () => void {
		return this.#parent.mountColumn(this.state.id, this as unknown as DataGridColumnBond);
	}
}

// DataGridColumnBond via defineBond over DataGridColumnBondBase; T carried by state/datagrid via generic facade.
const DataGridColumnBondImpl = defineBond<
	{ root: typeof DataGridColumnRootAtom },
	DataGridColumnBondState,
	typeof DataGridColumnBondBase
>({
	name: 'datagrid-column',
	base: DataGridColumnBondBase,
	atoms: { root: DataGridColumnRootAtom }
});

// Generic instance type — intersect to preserve Bond brand; narrows state/datagrid to carry T.
export type DataGridColumnBond<T = unknown> = BondOf<typeof DataGridColumnBondImpl> & {
	readonly state: DataGridColumnBondState<T>;
	readonly datagrid: IDataGrid<T>;
};

// Generic-constructor facade over the non-generic impl.
interface DataGridColumnBondConstructor {
	new <T = unknown>(state: DataGridColumnBondState<T>): DataGridColumnBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): DataGridColumnBond<T> | undefined;
	set<T = unknown>(bond: DataGridColumnBond<T>): DataGridColumnBond<T>;
}

export const DataGridColumnBond = DataGridColumnBondImpl as unknown as DataGridColumnBondConstructor;

export class DataGridColumnBondState<T = unknown> extends BondState<DataGridColumnBondProps> {
	constructor(props: DataGridColumnBondProps) {
		super(props);

		const datagrid = DataGridBond.get() as DataGridBond<T> | undefined;
		if (!datagrid) {
			throw new Error('DataGridColumnBond must be used within a DataGridBond context.');
		}
	}

	get isSortable(): boolean | SortableType | undefined {
		return this.props.sortable;
	}

	asc(): void {
		this.props.direction = 'asc';
	}

	desc(): void {
		this.props.direction = 'desc';
	}
}

// Backward-compatible aliases for existing imports.
export type DataGridThBondProps = DataGridColumnBondProps;
export type DataGridThElements = DataGridColumnElements;
export { DataGridColumnBond as DataGridThBond, DataGridColumnBondState as DataGridThBondState };
