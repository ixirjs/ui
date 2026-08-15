import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import type { Capability } from '$ixirjs/ui/shared/capability';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { specializeDefinition } from '$ixirjs/ui/shared/authoring/metadata';
import type { Collection } from '$ixirjs/ui/shared/bond/collection.svelte';
import {
	createSelection,
	selectionCapability,
	SELECTION,
	type SelectionModel
} from '$ixirjs/ui/shared/capability/models/selection.svelte';
import {
	createSort,
	sortCapability,
	SORT,
	type SortModel,
	type SortState
} from '$ixirjs/ui/shared/capability/models/sort.svelte';
import type { Direction, StateChangeContext } from '$ixirjs/ui/types';

export type DataGridBondProps<T = unknown> = BondStateProps & {
	multiple?: boolean;
	template?: string;
	values?: string[];
	selection?: T[];
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
	select(ids: string[], context?: Pick<StateChangeContext, 'event'>): void;
	unselect(ids: string[], context?: Pick<StateChangeContext, 'event'>): void;
	isSelected(id: string): boolean;
	mountRow(id: string, row: IDataGridRow<T>): () => void;
	mountColumn(id: string, col: IDataGridColumn): () => void;
	selectionCapability(): Capability | undefined;
	sortCapability(): Capability | undefined;
	readonly sort: SortModel;
	seedSort(field: string, direction: Direction): void;
	onSortCommit(id: string, listener: (state: SortState) => void): () => void;
	takeValuesChangeContext(): Pick<StateChangeContext, 'event'>;
}

export const DataGridRootAtom = defineAtom<DataGridBondBase, HTMLElement>('root');

export const DataGridHeaderAtom = defineAtom<DataGridBondBase, HTMLElement>('header');

export const DataGridBodyAtom = defineAtom<DataGridBondBase, HTMLElement>('body');

export const DataGridFooterAtom = defineAtom<DataGridBondBase, HTMLElement>('footer');

class DataGridBondBase<T = unknown> extends Bond<DataGridBondProps<T>> implements IDataGrid<T> {
	#valuesChangeContext: Pick<StateChangeContext, 'event'> | undefined;

	// One sort state for the whole grid. Previously each column owned its own `direction` and
	// flipped it locally, so clicking column B left column A still reporting itself as sorted.
	#sortState = $state<SortState>({});

	// Plain Map: per-column commit listeners, registration bookkeeping rather than reactive state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#sortListeners = new Map<string, (state: SortState) => void>();

	// Two-state cycle, matching the previous asc/desc toggle. The model's default cycle adds an
	// unsorted third step, which would be a behavior change for existing grids.
	readonly sort: SortModel = createSort(
		{
			get: () => this.#sortState,
			set: (state) => {
				this.#sortState = state;
				for (const listener of this.#sortListeners.values()) listener(state);
			}
		},
		{ cycle: ['asc', 'desc'] }
	);

	// Row-selection over props.values; mode fixed to 'multiple' to preserve legacy accumulation behaviour.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values ?? [],
		set: (v) => (this.props.values = v),
		mode: () => 'multiple'
	});

	// One pass: the map/filter chain allocated a full-length array of possibly-missing rows before
	// discarding the gaps. This scales with the selection, so it is the grid's, not a fixed cost.
	#selectedRows = $derived.by(() => {
		const values = this.props.values;
		if (!values?.length) return [] as IDataGridRow<T>[];
		const selected: IDataGridRow<T>[] = [];
		for (let index = 0; index < values.length; index++) {
			const row = this.rows.get(values[index]!);
			if (row !== undefined) selected.push(row);
		}
		return selected;
	});

	#sortableColumns = $derived([...this.columns.values].filter((col) => col.props.sortable));

	#template = $derived(
		this.props.template || [...this.columns.values].map((col) => col.props.width ?? '1fr').join(' ')
	);

	constructor(props: DataGridBondProps<T>) {
		super(props, 'datagrid');
		// Projects aria-selected/data-selected via role:'item'; interactive:false — selection driven by row/checkbox.
		this.capability(selectionCapability(this.#selection, { interactive: false }));
		// Projects role="columnheader" + aria-sort + focusability onto columns via role:'column'.
		// Registered here so every column shares one model; each column bond re-registers this same
		// descriptor, exactly as rows re-register the selection capability.
		this.capability(sortCapability(this.sort, { roles: ['column'] }));
		// Eagerly create owned collections outside derived reads; collection() registers a capability.
		void this.rows;
		void this.columns;
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

	select(ids: string[], context?: Pick<StateChangeContext, 'event'>): void {
		this.#commitSelectionContext(context, () => this.#selection.select(ids));
	}

	unselect(ids: string[], context?: Pick<StateChangeContext, 'event'>): void {
		this.#commitSelectionContext(context, () => this.#selection.deselect(ids));
	}

	takeValuesChangeContext(): Pick<StateChangeContext, 'event'> {
		const context = this.#valuesChangeContext ?? {};
		this.#valuesChangeContext = undefined;
		return context;
	}

	#commitSelectionContext(
		context: Pick<StateChangeContext, 'event'> | undefined,
		commit: () => void
	): void {
		this.#valuesChangeContext = context;
		try {
			commit();
		} finally {
			this.#valuesChangeContext = undefined;
		}
	}

	isSelected(id: string): boolean {
		return this.props.values?.includes(id) ?? false;
	}

	selectionCapability(): Capability | undefined {
		return this.capability(SELECTION);
	}

	sortCapability(): Capability | undefined {
		return this.capability(SORT);
	}

	/**
	 * Point the shared sort at one column without notifying, so the capability's own toggle
	 * continues from the direction that column is currently showing rather than restarting the
	 * cycle. Called by a column the moment it is activated, before the toggle runs.
	 */
	seedSort(field: string, direction: Direction): void {
		this.#sortState = { field, direction };
	}

	onSortCommit(id: string, listener: (state: SortState) => void): () => void {
		this.#sortListeners.set(id, listener);
		return () => this.#sortListeners.delete(id);
	}
}

const DataGridBondDefinition = defineBond({
	name: 'datagrid',
	base: DataGridBondBase,
	atoms: {
		root: DataGridRootAtom,
		header: DataGridHeaderAtom,
		body: DataGridBodyAtom,
		footer: DataGridFooterAtom
	}
});

export type DataGridBond<T = unknown> = BondOf<typeof DataGridBondDefinition> & {
	readonly __props?: DataGridBondProps<T>;
	readonly rows: Collection<IDataGridRow<T>>;
	readonly columns: Collection<IDataGridColumn>;
	readonly selectedRows: readonly IDataGridRow<T>[];
	readonly sortableColumns: readonly IDataGridColumn[];
	mountRow(id: string, row: IDataGridRow<T>): () => void;
	mountColumn(id: string, col: IDataGridColumn): () => void;
} & IDataGrid<T>;

// TS cannot retain a class value's type parameter through `typeof DataGridBondDefinition`; this
// minimal static facade preserves generic construction and context lookup ergonomics.
interface DataGridBondGenericFacade {
	new <T = unknown>(props: DataGridBondProps<T>): DataGridBond<T>;
	get<T = unknown>(): DataGridBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): DataGridBond<T>;
	create<T = unknown>(props: DataGridBondProps<T>): DataGridBond<T>;
}

// Replace only generic-sensitive signatures. The mapped original retains defineBond's
// untouched statics and definition phantom metadata while dropping its construct signature.
type DataGridBondConstructor = Omit<
	typeof DataGridBondDefinition,
	keyof DataGridBondGenericFacade
> &
	DataGridBondGenericFacade;

export const DataGridBond = specializeDefinition<DataGridBondConstructor>(DataGridBondDefinition);
