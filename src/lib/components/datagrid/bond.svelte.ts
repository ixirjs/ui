import {
	Bond,
	defineAtom,
	type BondStateProps,
	type Capability
} from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import type { Collection } from '$svelte-atoms/core/shared/bond/collection.svelte';
import {
	createSelection,
	selectionCapability,
	SELECTION,
	type SelectionModel
} from '$svelte-atoms/core/shared/capability/models/selection.svelte';
import { nanoid } from 'nanoid';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridBondProps<T = unknown> = BondStateProps & {
	multiple?: boolean;
	template?: string;
	values?: string[];
	selection?: T[];
};

/** @deprecated Use `DataGridBondProps` instead. */
export type DataGridStateProps<T = unknown> = DataGridBondProps<T>;

export type DataGridElements = {
	root: HTMLElement;
	header: HTMLElement;
	body: HTMLElement;
	footer: HTMLElement;
};

export interface IDataGridRow<T = unknown> {
	readonly id: string;
	readonly isSelected: boolean;
	readonly isHeader: boolean;
	readonly props: { value?: string; data?: T };
}

export interface IDataGridColumn {
	readonly id: string;
	readonly index: number;
	readonly props: { width?: string; sortable?: unknown; hidden?: boolean };
}

// Narrow parent contract for row/column children; DataGridBond implements this.
export interface IDataGrid<T = unknown> {
	readonly id: string;
	readonly rows: Collection<IDataGridRow<T>>;
	readonly columns: Collection<IDataGridColumn>;
	readonly selectedRows: readonly IDataGridRow<T>[];
	readonly sortableColumns: readonly IDataGridColumn[];
	readonly template: string;
	select(ids: string[]): void;
	unselect(ids: string[]): void;
	isSelected(id: string): boolean;
	mountRow(id: string, row: IDataGridRow<T>): () => void;
	mountColumn(id: string, col: IDataGridColumn): () => void;
	selectionCapability(): Capability | undefined;
}

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DataGridBondView = DataGridBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const DataGridRootAtom = defineAtom<DataGridBondView, HTMLElement>('root');
export type DataGridRootAtom = InstanceType<typeof DataGridRootAtom>;

export const DataGridHeaderAtom = defineAtom<DataGridBondView, HTMLElement>('header');
export type DataGridHeaderAtom = InstanceType<typeof DataGridHeaderAtom>;

export const DataGridBodyAtom = defineAtom<DataGridBondView, HTMLElement>('body');
export type DataGridBodyAtom = InstanceType<typeof DataGridBodyAtom>;

export const DataGridFooterAtom = defineAtom<DataGridBondView, HTMLElement>('footer');
export type DataGridFooterAtom = InstanceType<typeof DataGridFooterAtom>;

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class DataGridBondBase<T = unknown> extends Bond<DataGridBondProps<T>> implements IDataGrid<T> {
	readonly #id: string = nanoid();

	// Row-selection over props.values; mode fixed to 'multiple' to preserve legacy accumulation behaviour.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values ?? [],
		set: (v) => (this.props.values = v),
		mode: () => 'multiple'
	});

	#selectedRows = $derived(
		(this.props.values ?? [])
			.map((value) => this.rows.get(value))
			.filter((r): r is IDataGridRow<T> => r !== undefined)
	);

	#sortableColumns = $derived([...this.columns.values].filter((col) => col.props.sortable));

	#template = $derived(
		this.props.template || [...this.columns.values].map((col) => col.props.width ?? '1fr').join(' ')
	);

	constructor(props: DataGridBondProps<T>) {
		super(props, 'datagrid');
		// Projects aria-selected/data-selected via role:'item'; interactive:false — selection driven by row/checkbox.
		this.capability(selectionCapability(this.#selection, { interactive: false }));
		// Eagerly create owned collections outside derived reads; collection() registers a capability.
		void this.rows;
		void this.columns;
	}

	get id() {
		return this.#id;
	}

	get rows(): Collection<IDataGridRow<T>> {
		return this.collection<IDataGridRow<T>>('row');
	}

	get columns(): Collection<IDataGridColumn> {
		return this.collection<IDataGridColumn>('column');
	}

	get selection(): SelectionModel<string> {
		return this.#selection;
	}

	get selectedRows(): readonly IDataGridRow<T>[] {
		return this.#selectedRows;
	}

	get sortableColumns(): readonly IDataGridColumn[] {
		return this.#sortableColumns;
	}

	get template(): string {
		return this.#template;
	}

	mountColumn(id: string, item: IDataGridColumn): () => void {
		return this.columns.set(id, item);
	}

	mountRow(id: string, item: IDataGridRow<T>): () => void {
		return this.rows.set(id, item);
	}

	select(ids: string[]): void {
		this.#selection.select(ids);
	}

	unselect(ids: string[]): void {
		this.#selection.deselect(ids);
	}

	isSelected(id: string): boolean {
		return this.props.values?.includes(id) ?? false;
	}

	selectionCapability(): Capability | undefined {
		return this.capability(SELECTION);
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const DataGridBondImpl = defineBond<
	{
		root: typeof DataGridRootAtom;
		header: typeof DataGridHeaderAtom;
		body: typeof DataGridBodyAtom;
		footer: typeof DataGridFooterAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof DataGridBondBase
>({
	name: 'datagrid',
	base: DataGridBondBase,
	atoms: {
		root: DataGridRootAtom,
		header: DataGridHeaderAtom,
		body: DataGridBodyAtom,
		footer: DataGridFooterAtom
	}
});

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridBond<T = unknown> = BondOf<typeof DataGridBondImpl> & {
	readonly __props?: DataGridBondProps<T>;
	readonly rows: Collection<IDataGridRow<T>>;
	readonly columns: Collection<IDataGridColumn>;
	readonly selectedRows: readonly IDataGridRow<T>[];
	readonly sortableColumns: readonly IDataGridColumn[];
	mountRow(id: string, row: IDataGridRow<T>): () => void;
	mountColumn(id: string, col: IDataGridColumn): () => void;
} & IDataGrid<T>;

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

interface DataGridBondConstructor {
	new <T = unknown>(props: DataGridBondProps<T>): DataGridBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): DataGridBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): DataGridBond<T>;
	set<T = unknown>(bond: DataGridBond<T>): DataGridBond<T>;
	create<T = unknown>(props: DataGridBondProps<T>): DataGridBond<T>;
}

export const DataGridBond = DataGridBondImpl as unknown as DataGridBondConstructor;
