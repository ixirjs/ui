/**
 * DataGrid's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Rows and columns register into two mount-ordered collections; selection and sort are the plain
 * models over the grid's own props; the parts write the ARIA the capabilities used to project.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { Collection } from '$ixirjs/ui/utils/collection.svelte';
import {
	createSelection,
	type SelectionModel
} from '$ixirjs/ui/capability/models/selection.svelte';
import {
	createSort,
	type SortModel,
	type SortState
} from '$ixirjs/ui/capability/models/sort.svelte';
import type { Direction, StateChangeContext } from '$ixirjs/ui/types';

export type DataGridBondProps<T = unknown> = {
	id?: string | undefined;
	multiple?: boolean | undefined;
	template?: string | undefined;
	values?: string[] | undefined;
	selection?: T[] | undefined;
};

export interface IDataGridRow<T = unknown> {
	readonly id: string;
	readonly isSelected: boolean;
	readonly isHeader: boolean;
	readonly props: { value?: string | undefined; data?: T | undefined };
}

export interface IDataGridColumn {
	readonly id: string;
	readonly index: number;
	readonly props: { width?: string | undefined; sortable?: unknown; hidden?: boolean | undefined };
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
	columnAt(index: number): IDataGridColumn | undefined;
	mountRow(id: string, row: IDataGridRow<T>): () => void;
	mountColumn(id: string, col: IDataGridColumn): () => void;
	readonly sort: SortModel;
	seedSort(field: string, direction: Direction): void;
	onSortCommit(id: string, listener: (state: SortState) => void): () => void;
	takeValuesChangeContext(): Pick<StateChangeContext, 'event'>;
}

export const DataGridContext = Kernel.context<DataGridBond>('bond/datagrid');

// `any`: the grid's row type must not make the class invariant in `T` through this callback.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Commit = (values: string[], context: StateChangeContext<DataGridBond<any>>) => void;

function sameValues(left: readonly string[], right: readonly string[]): boolean {
	return left.length === right.length && left.every((item, index) => item === right[index]);
}

export class DataGridBond<T = unknown> implements IDataGrid<T> {
	static readonly CONTEXT_KEY = DataGridContext.key;
	static get<T = unknown>(): DataGridBond<T> | undefined {
		return DataGridContext.get() as DataGridBond<T> | undefined;
	}
	static getOrThrow<T = unknown>(message?: string): DataGridBond<T> {
		return DataGridContext.getOrThrow(message) as DataGridBond<T>;
	}
	static create<T = unknown>(props: DataGridBondProps<T>): DataGridBond<T> {
		return new DataGridBond<T>(props);
	}

	readonly name = 'datagrid';
	/** Mounted rows and columns, in document order. */
	readonly rows = new Collection<IDataGridRow<T>>('row');
	readonly columns = new Collection<IDataGridColumn>('column');

	#commit: Commit | undefined;
	#valuesChangeContext: Pick<StateChangeContext, 'event'> | undefined;

	// One sort state for the whole grid, so only the last column pressed reports itself sorted.
	#sortState = $state<SortState>({});
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#sortListeners = new Map<string, (state: SortState) => void>();

	// Two-state cycle, matching the asc/desc toggle grids always had.
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

	// Row selection over props.values; mode fixed to 'multiple' to preserve accumulation.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values ?? [],
		set: (values) => this.#commitValues(values),
		mode: () => 'multiple',
		indexed: true
	});

	#selectedRows = $derived.by(() => {
		const values = this.props.values;
		void this.rows.size;
		if (!values?.length) return [] as IDataGridRow<T>[];
		const selected: IDataGridRow<T>[] = [];
		for (let index = 0; index < values.length; index++) {
			const row = this.rows.get(values[index]!);
			if (row !== undefined) selected.push(row);
		}
		return selected;
	});

	#sortableColumns = $derived.by(() => this.columns.values.filter((col) => col.props.sortable));

	#template = $derived.by(
		() =>
			this.props.template || this.columns.values.map((col) => col.props.width ?? '1fr').join(' ')
	);

	// A parameter property: assigned before the field initializers above read `this.props`.
	constructor(readonly props: DataGridBondProps<T>) {}

	/** @internal The root wires how a new value set is written and reported. */
	bindCommit(commit: Commit): void {
		this.#commit = commit;
	}

	get id(): string {
		return this.props.id ?? this.name;
	}
	/** Release every registration — for grids built outside a component. */
	destroy(): void {
		this.rows.clear();
		this.columns.clear();
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

	columnAt(index: number): IDataGridColumn | undefined {
		return this.columns.values[index];
	}
	mountColumn(id: string, item: IDataGridColumn): () => void {
		return this.columns.set(id, item);
	}
	mountRow(id: string, item: IDataGridRow<T>): () => void {
		return this.rows.set(id, item);
	}

	select(ids: string[], context?: Pick<StateChangeContext, 'event'>): void {
		this.#withContext(context, () => this.#selection.select(ids));
	}
	unselect(ids: string[], context?: Pick<StateChangeContext, 'event'>): void {
		this.#withContext(context, () => this.#selection.deselect(ids));
	}
	isSelected(id: string): boolean {
		return this.#selection.isSelected(id);
	}
	takeValuesChangeContext(): Pick<StateChangeContext, 'event'> {
		const context = this.#valuesChangeContext ?? {};
		this.#valuesChangeContext = undefined;
		return context;
	}
	#withContext(context: Pick<StateChangeContext, 'event'> | undefined, run: () => void): void {
		this.#valuesChangeContext = context;
		try {
			run();
		} finally {
			this.#valuesChangeContext = undefined;
		}
	}
	#commitValues(next: string[]): void {
		if (sameValues(next, this.props.values ?? [])) return;
		if (this.#commit) this.#commit(next, { bond: this, ...this.takeValuesChangeContext() });
		else this.props.values = next;
	}

	/**
	 * Point the shared sort at one column without notifying, so the toggle continues from the
	 * direction that column is showing rather than restarting the cycle.
	 */
	seedSort(field: string, direction: Direction): void {
		this.#sortState = { field, direction };
	}
	onSortCommit(id: string, listener: (state: SortState) => void): () => void {
		this.#sortListeners.set(id, listener);
		return () => this.#sortListeners.delete(id);
	}
}
