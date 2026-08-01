import {
	BondState,
	BondAtom,
	type BondStateProps,
	type Capability
} from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import type { Collection } from '$svelte-atoms/core/shared/collection.svelte';
import {
	createSelection,
	selectionCapability,
	type SelectionModel
} from '$svelte-atoms/core/shared/capabilities/selection.svelte';
import { nanoid } from 'nanoid';
import type { DataGridRowBond } from './row/bond.svelte';
import type { DataGridColumnBond } from './column/bond.svelte';

export type DataGridStateProps<T> = BondStateProps & {
	multiple?: boolean;
	template?: string;
	values?: string[];
	selection?: T[];
};

export type DataGridElements = {
	root: HTMLElement;
	header: HTMLElement;
	body: HTMLElement;
	footer: HTMLElement;
};

// Narrow parent contract for row/column children; DataGridState implements this.
export interface IDataGrid<T = unknown> {
	select(ids: string[]): void;
	unselect(ids: string[]): void;
	isSelected(id: string): boolean;
	mountRow(id: string, row: DataGridRowBond<T>): () => void;
	mountColumn(id: string, col: DataGridColumnBond<T>): () => void;
	selectionCapability(): Capability | undefined;
}

// Bond shape the datagrid atoms type this.bond against — breaks the atom↔bond cycle.
type DataGridBondView = ViewOf<DataGridBondState>;

class DataGridRootAtom extends BondAtom<DataGridBondView, HTMLElement> {
	constructor(bond: DataGridBondView) {
		super(bond, 'root');
	}
}

class DataGridHeaderAtom extends BondAtom<DataGridBondView, HTMLElement> {
	constructor(bond: DataGridBondView) {
		super(bond, 'header');
	}
}

class DataGridBodyAtom extends BondAtom<DataGridBondView, HTMLElement> {
	constructor(bond: DataGridBondView) {
		super(bond, 'body');
	}
}

class DataGridFooterAtom extends BondAtom<DataGridBondView, HTMLElement> {
	constructor(bond: DataGridBondView) {
		super(bond, 'footer');
	}
}

// DataGridBond via defineBond; T is a runtime phantom on state — exposed via generic-constructor facade.
const DataGridBondImpl = defineBond<
	{
		root: typeof DataGridRootAtom;
		header: typeof DataGridHeaderAtom;
		body: typeof DataGridBodyAtom;
		footer: typeof DataGridFooterAtom;
	},
	DataGridBondState
>({
	name: 'datagrid',
	atoms: {
		root: DataGridRootAtom,
		header: DataGridHeaderAtom,
		body: DataGridBodyAtom,
		footer: DataGridFooterAtom
	}
});

// Generic instance type — intersect (not Omit) to preserve Bond brand; narrows state to carry T.
export type DataGridBond<T = unknown> = BondOf<typeof DataGridBondImpl> & {
	readonly state: DataGridBondState<T>;
};

// Generic-constructor facade over the non-generic DataGridBondImpl.
interface DataGridBondConstructor {
	new <T = unknown>(state: DataGridBondState<T>): DataGridBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): DataGridBond<T> | undefined;
	set<T = unknown>(bond: DataGridBond<T>): DataGridBond<T>;
}

export const DataGridBond = DataGridBondImpl as unknown as DataGridBondConstructor;

export class DataGridBondState<T = unknown>
	extends BondState<DataGridStateProps<T>>
	implements IDataGrid<T>
{
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
			.filter((r): r is DataGridRowBond<T> => r !== undefined)
	);

	#sortableColumns = $derived(
		[...this.columns.values].filter((col) => col.state.props.sortable)
	);

	#template = $derived(
		this.props.template ||
			[...this.columns.values].map((col) => col.state.props.width ?? '1fr').join(' ')
	);

	constructor(props: DataGridStateProps<T>) {
		super(props);
		// Projects aria-selected/data-selected via role:'item'; interactive:false — selection driven by row/checkbox.
		this.capability(selectionCapability(this.#selection, { interactive: false }));
		// Eagerly register collections to avoid write side-effects inside #template derived.
		void this.rows;
		void this.columns;
	}

	get id() {
		return this.#id;
	}

	get rows(): Collection<DataGridRowBond<T>> {
		return this.collection<DataGridRowBond<T>>('row');
	}

	get columns(): Collection<DataGridColumnBond<T>> {
		return this.collection<DataGridColumnBond<T>>('column');
	}

	get selection(): SelectionModel<string> {
		return this.#selection;
	}

	get selectedRows(): readonly DataGridRowBond<T>[] {
		return this.#selectedRows;
	}

	get sortableColumns(): readonly DataGridColumnBond<T>[] {
		return this.#sortableColumns;
	}

	get template(): string {
		return this.#template;
	}

	mountColumn(id: string, item: DataGridColumnBond<T>): () => void {
		return this.columns.attach(id, item);
	}

	mountRow(id: string, item: DataGridRowBond<T>): () => void {
		return this.rows.attach(id, item);
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
		return this.capability('selection');
	}
}
