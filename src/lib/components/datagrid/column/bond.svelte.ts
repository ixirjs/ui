import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { Direction, SortableType } from '$ixirjs/ui/types';
import {
	DataGridContext,
	type DataGridBond,
	type IDataGrid,
	type IDataGridColumn
} from '$ixirjs/ui/components/datagrid/bond.svelte';

export type DataGridColumnBondProps = {
	id: string;
	width?: string | undefined;
	screen?: string | undefined;
	sortable?: boolean | SortableType | undefined;
	hidden?: boolean | undefined;
	direction: Direction;
};

export const DataGridColumnContext = Kernel.context<DataGridColumnBond>('bond/datagrid-column');

export class DataGridColumnBond<T = unknown> implements IDataGridColumn {
	static readonly CONTEXT_KEY = DataGridColumnContext.key;
	static get<T = unknown>(): DataGridColumnBond<T> | undefined {
		return DataGridColumnContext.get() as DataGridColumnBond<T> | undefined;
	}
	static getOrThrow<T = unknown>(message?: string): DataGridColumnBond<T> {
		return DataGridColumnContext.getOrThrow(message) as DataGridColumnBond<T>;
	}
	static create<T = unknown>(props: DataGridColumnBondProps): DataGridColumnBond<T> {
		return new DataGridColumnBond<T>(props);
	}

	readonly name = 'datagrid-column';
	readonly props: DataGridColumnBondProps;
	readonly #parent: IDataGrid<T>;
	#sortActivation: { event: Event; reason: 'click' | 'keyboard' } | undefined;
	#onSortCommit: ((column: DataGridColumnBond<T>) => void) | undefined;

	constructor(
		props: DataGridColumnBondProps,
		grid: DataGridBond<T> | undefined = DataGridContext.get() as DataGridBond<T> | undefined
	) {
		if (!grid) throw new Error('DataGridColumnBond must be used within a DataGridBond context.');
		this.props = props;
		this.#parent = grid;
	}

	get datagrid(): IDataGrid<T> {
		return this.#parent;
	}
	get id(): string {
		return this.props.id;
	}
	/** `datagrid-column-root-<id>`. */
	get elementId(): string {
		return Kernel.id(this.id, 'datagrid-column-root');
	}
	get element(): HTMLElement | null {
		return typeof document === 'undefined' ? null : document.getElementById(this.elementId);
	}
	get isSortable(): boolean | SortableType | undefined {
		return this.props.sortable;
	}
	get isHidden(): boolean {
		const el = this.element;
		if (!el) return false;
		return Boolean(el.hidden) || getComputedStyle(el).display === 'none';
	}
	get index(): number {
		const el = this.element;
		return el ? Array.from(el.parentElement?.children ?? []).indexOf(el) : -1;
	}
	get text(): string {
		return this.element?.innerText ?? '';
	}

	/** Called by the column component to receive sort commits for this column. */
	set onSortCommit(listener: ((column: DataGridColumnBond<T>) => void) | undefined) {
		this.#onSortCommit = listener;
	}

	/**
	 * Stage an activation, then point the shared sort at this column so the toggle continues from
	 * the direction this column is showing. The commit comes back through {@link mount}'s listener.
	 */
	beginSort(event: Event, reason: 'click' | 'keyboard'): void {
		this.#sortActivation = { event, reason };
		this.#parent.seedSort(this.id, this.props.direction);
	}
	/** A user activation: stage it, then toggle the grid's sort on this column. */
	activate(event: Event, reason: 'click' | 'keyboard'): void {
		this.beginSort(event, reason);
		this.#parent.sort.toggle(this.id);
	}
	takeSortActivation(): { event?: Event; reason?: 'click' | 'keyboard' } {
		const activation = this.#sortActivation ?? {};
		this.#sortActivation = undefined;
		return activation;
	}

	mount(): () => void {
		const unmountColumn = this.#parent.mountColumn(this.id, this);
		const unlisten = this.#parent.onSortCommit(this.id, (state) => {
			if (state.field !== this.id || !state.direction) return;
			this.props.direction = state.direction;
			this.#onSortCommit?.(this);
		});
		return () => {
			unlisten();
			unmountColumn();
		};
	}

	asc(): void {
		this.props.direction = 'asc';
		this.#parent.seedSort(this.id, 'asc');
	}
	desc(): void {
		this.props.direction = 'desc';
		this.#parent.seedSort(this.id, 'desc');
	}
}
