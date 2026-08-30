import { untrack } from 'svelte';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type {
	DataGridBond,
	IDataGrid,
	IDataGridRow
} from '$ixirjs/ui/components/datagrid/bond.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

/**
 * What a row IS to a consumer — the surface `{ row }` hands out and `DataGrid.Checkbox` reads.
 *
 * Declared as an interface rather than as `DataGridRowBond` because a row does not need to be a
 * Bond to offer it, and being one is expensive: `bun run bench:row` measures the row's Bond and its
 * element at ~70% of a three-cell row, against ~2.6 µs for a cell. Both shapes implement this, so
 * `row.select()` / `row.isSelected` compile and behave identically either way.
 */
export interface IDataGridRowApi<T = unknown> extends IDataGridRow<T> {
	readonly datagrid: IDataGrid<T>;
	/** `datagrid-row-root-<id>` — the element the row renders. */
	readonly elementId: string;
	/** Register with the grid; returns the release. */
	mount(): () => void;
	select(context?: Pick<StateChangeContext, 'event'>): void;
	unselect(context?: Pick<StateChangeContext, 'event'>): void;
}

export type RowRecordOptions<T> = {
	seed: string;
	value: () => string | undefined;
	data: () => T | undefined;
	isHeader: () => boolean;
};

/**
 * The default row: a plain record registered with the grid, holding no state of its own.
 *
 * Selection lives in the grid — which is where it already lived; the row Bond only ever *read* it
 * through `#parent.isSelected(id)`. So the Bond was carrying identity, not state, and identity is
 * what a `Collection` entry already is. This is the same division `@tanstack/table-core` makes,
 * where `rowSelection` is one keyed map on the table and a row is a plain object.
 *
 * Everything reactive here is a getter over the grid, so selection stays live without this object
 * owning a single signal.
 */
export class DataGridRowRecord<T = unknown> implements IDataGridRowApi<T> {
	readonly #grid: DataGridBond<T>;
	readonly #options: RowRecordOptions<T>;
	readonly #seed: string;

	constructor(grid: DataGridBond<T>, options: RowRecordOptions<T>) {
		this.#grid = grid;
		this.#options = options;
		this.#seed = options.seed;
	}

	/** The collection key, and the seed the element id derives from. Mirrors `Bond.id`. */
	get id(): string {
		return this.#options.value() ?? this.#seed;
	}

	/** `datagrid-row-root-<id>`, the same shape the row Atom produced. */
	get elementId(): string {
		// Cached per id: this is read on every render of every row for a string that changes only
		// with `value`.
		const id = this.id;
		if (this.#elementIdFor !== id) {
			this.#elementIdFor = id;
			this.#elementId = Kernel.id(id, 'datagrid-row-root');
		}
		return this.#elementId!;
	}
	#elementIdFor: string | undefined;
	#elementId: string | undefined;

	get isSelected(): boolean {
		return this.#grid.isSelected(this.id);
	}

	get isHeader(): boolean {
		return this.#options.isHeader();
	}

	get datagrid(): IDataGrid<T> {
		return this.#grid;
	}

	// Built rather than stored: `exactOptionalPropertyTypes` distinguishes an absent key from an
	// `undefined` one, and `IDataGridRow` declares both as optional.
	get props(): { value?: string; data?: T } {
		const value = this.#options.value();
		const data = this.#options.data();
		return {
			...(value !== undefined ? { value } : {}),
			...(data !== undefined ? { data } : {})
		};
	}

	select(context?: Pick<StateChangeContext, 'event'>): void {
		this.#grid.select([this.id], context);
	}

	unselect(context?: Pick<StateChangeContext, 'event'>): void {
		this.#grid.unselect([this.id], context);
	}

	/**
	 * Register with the grid. `untrack`ed for the reason `Bond.mount` callers untrack: `set` reads
	 * the collection's version signal, and a tracked read here would subscribe the registering
	 * effect to the signal it bumps — which silently reorders the collection.
	 */
	mount(): () => void {
		return untrack(() => this.#grid.mountRow(this.id, this));
	}
}

let generated = 0;
/** A stable seed for a row that declares no `value`, matching what a Bond would have generated. */
export function rowSeed(id: string | undefined): string {
	return id ?? `ix${++generated}`;
}
