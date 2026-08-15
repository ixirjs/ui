import type { Direction, SortableType } from '$ixirjs/ui/types';
import { DataGridBond, type IDataGrid } from '$ixirjs/ui/components/datagrid/bond.svelte';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { specializeDefinition } from '$ixirjs/ui/shared/authoring/metadata';
import { rowColumnCellLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';

export type DataGridColumnBondProps = BondStateProps & {
	id: string;
	width?: string;
	screen?: string;
	sortable?: boolean | SortableType;
	hidden?: boolean;
	direction: Direction;
};

export const DataGridColumnRootAtom = defineAtom<DataGridColumnBondBase>('root', {
	slot: '@ixirjs/datagrid-column:root',
	docs: 'Datagrid column identity, sortable, and direction projection.',
	attrs: (_node, bond) => {
		const props = bond?.props;

		return {
			'data-sortable': props?.sortable ? 'true' : undefined,
			'data-direction': props?.direction
		};
	},
	// The column id is the sort field, carried as the role's projection context so one shared
	// sortCapability can serve every column from a single slot.
	setup: (atom, bond) => atom.role('column', bond?.props.id)
});

class DataGridColumnBondBase<T = unknown> extends Bond<DataGridColumnBondProps> {
	readonly #parent: IDataGrid<T>;
	#sortActivation: { event: Event; reason: 'click' | 'keyboard' } | undefined;
	#onSortCommit: ((column: DataGridColumnBondBase<T>) => void) | undefined;

	constructor(props: DataGridColumnBondProps) {
		super(props, 'datagrid-column');
		const datagrid = DataGridBond.get() as DataGridBond<T> | undefined;
		if (!datagrid) {
			throw new Error('DataGridColumnBond must be used within a DataGridBond context.');
		}
		this.#parent = datagrid;
		this.capability(rowColumnCellLink());
		// Re-register the grid's own sort descriptor so this column's atoms project against the one
		// shared model — the same pattern rows use for the grid's selection capability.
		const sort = datagrid.sortCapability();
		if (sort) this.capability(sort);
	}

	/**
	 * Stage an activation, then point the shared sort at this column so the capability's toggle
	 * continues from the direction this column is showing. The capability's own handler runs next
	 * and performs the toggle; the commit comes back through {@link mount}'s listener.
	 */
	beginSort(event: Event, reason: 'click' | 'keyboard'): void {
		this.#sortActivation = { event, reason };
		this.#parent.seedSort(this.id, this.props.direction);
	}

	takeSortActivation(): { event?: Event; reason?: 'click' | 'keyboard' } {
		const activation = this.#sortActivation ?? {};
		this.#sortActivation = undefined;
		return activation;
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

	get datagrid(): IDataGrid<T> {
		return this.#parent;
	}

	get id(): string {
		return this.props.id;
	}

	get isSortable(): boolean | SortableType | undefined {
		return this.props.sortable;
	}

	/** Called by the column component to receive sort commits for this column. */
	set onSortCommit(listener: ((column: DataGridColumnBondBase<T>) => void) | undefined) {
		this.#onSortCommit = listener;
	}

	mount(): () => void {
		const unmountColumn = this.#parent.mountColumn(this.id, this);
		const unlisten = this.#parent.onSortCommit(this.id, (state) => {
			// Only the column that now owns the sort commits and reports; the others simply stop
			// being the sorted column, which `aria-sort` already reflects through the shared model.
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

// DataGridColumnBond via defineBond over DataGridColumnBondBase; T carried by state/datagrid via generic facade.

const DataGridColumnBondDefinition = defineBond({
	name: 'datagrid-column',
	base: DataGridColumnBondBase,
	atoms: { root: DataGridColumnRootAtom }
});

// Generic instance type — intersect to preserve Bond brand; narrows state/datagrid to carry T.

export type DataGridColumnBond<T = unknown> = BondOf<typeof DataGridColumnBondDefinition> & {
	readonly __props?: DataGridColumnBondProps;
	readonly datagrid: IDataGrid<T>;
	readonly id: string;
	readonly isSortable: boolean | SortableType | undefined;
	asc(): void;
	desc(): void;
};

// Generic-constructor facade over the non-generic impl.

// TS cannot retain a class value's type parameter through `typeof DataGridColumnBondDefinition`; this
// minimal static facade preserves generic construction and context lookup ergonomics.
interface DataGridColumnBondGenericFacade {
	new <T = unknown>(props: DataGridColumnBondProps): DataGridColumnBond<T>;
	get<T = unknown>(): DataGridColumnBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): DataGridColumnBond<T>;
	create<T = unknown>(props: DataGridColumnBondProps): DataGridColumnBond<T>;
}

// Replace only generic-sensitive signatures. The mapped original retains defineBond's
// untouched statics and definition phantom metadata while dropping its construct signature.
type DataGridColumnBondConstructor = Omit<
	typeof DataGridColumnBondDefinition,
	keyof DataGridColumnBondGenericFacade
> &
	DataGridColumnBondGenericFacade;

export const DataGridColumnBond = specializeDefinition<DataGridColumnBondConstructor>(
	DataGridColumnBondDefinition
);
