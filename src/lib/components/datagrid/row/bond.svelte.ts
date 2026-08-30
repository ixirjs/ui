import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	DataGridContext,
	type DataGridBond,
	type IDataGrid
} from '$ixirjs/ui/components/datagrid/bond.svelte';
import { getDatagridHeaderContext } from '$ixirjs/ui/components/datagrid/context';
import type { IDataGridRowApi } from './record.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type DataGridRowBondProps<T = unknown> = {
	id?: string | undefined;
	value?: string | undefined;
	data?: T | undefined;
};

export const DataGridRowContext = Kernel.context<DataGridRowBond>('bond/datagrid-row');

/** The row a consumer builds through `factory`; the default row is the plain `DataGridRowRecord`. */
export class DataGridRowBond<T = unknown> implements IDataGridRowApi<T> {
	static readonly CONTEXT_KEY = DataGridRowContext.key;
	static get<T = unknown>(): DataGridRowBond<T> | undefined {
		return DataGridRowContext.get() as DataGridRowBond<T> | undefined;
	}
	static getOrThrow<T = unknown>(message?: string): DataGridRowBond<T> {
		return DataGridRowContext.getOrThrow(message) as DataGridRowBond<T>;
	}
	static create<T = unknown>(props: DataGridRowBondProps<T>): DataGridRowBond<T> {
		return new DataGridRowBond<T>(props);
	}

	readonly name = 'datagrid-row';
	readonly props: DataGridRowBondProps<T>;
	readonly #parent: IDataGrid<T>;
	readonly #isHeader: () => boolean;

	constructor(
		props: DataGridRowBondProps<T>,
		grid: DataGridBond<T> | undefined = DataGridContext.get() as DataGridBond<T> | undefined,
		isHeader: () => boolean = headerFlag()
	) {
		if (!grid) throw new Error('DataGridRowBond must be used within a DataGridBond context.');
		this.props = props;
		this.#parent = grid;
		this.#isHeader = isHeader;
	}

	get datagrid(): IDataGrid<T> {
		return this.#parent;
	}
	get id(): string {
		return this.props.value ?? this.props.id ?? this.name;
	}
	/** `datagrid-row-root-<id>`. */
	get elementId(): string {
		return Kernel.id(this.id, 'datagrid-row-root');
	}
	get isSelected(): boolean {
		return this.#parent.isSelected(this.id);
	}
	get isHeader(): boolean {
		return this.#isHeader();
	}
	mount(): () => void {
		return this.#parent.mountRow(this.id, this);
	}
	select(context?: Pick<StateChangeContext, 'event'>): void {
		this.#parent.select([this.id], context);
	}
	unselect(context?: Pick<StateChangeContext, 'event'>): void {
		this.#parent.unselect([this.id], context);
	}
}

function headerFlag(): () => boolean {
	const header = getDatagridHeaderContext();
	return () => header?.isHeader ?? false;
}
