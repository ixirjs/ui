import type { Direction, SortableType } from '$svelte-atoms/core/types';
import { DataGridBond, type IDataGrid } from '../bond.svelte';
import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import { rowColumnCellLink } from '$svelte-atoms/core/shared/capability/models/relationship.svelte';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DataGridColumnBondView = DataGridColumnBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const DATAGRID_COLUMN_ROOT = sharedCapabilityKey<void>('@svelte-atoms/datagrid-column:root');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const DataGridColumnRootAtom = defineAtom<DataGridColumnBondView>('root', (atom) => {
	atom.role('column');
	atom.capability(datagridColumnPresentation());
});
export type DataGridColumnRootAtom = InstanceType<typeof DataGridColumnRootAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function datagridColumnPresentation() {
	return defineAtomCapability<void, AtomHost, DataGridColumnBondView>({
		slot: DATAGRID_COLUMN_ROOT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['root'],
			docs: 'Datagrid column identity, sortable, and direction projection.'
		},
		behavior: {
			attrs: (_node, bond) => {
				const props = bond?.props;

				return {
					'data-sortable': props?.sortable ? 'true' : undefined,
					'data-direction': props?.direction
				};
			}
		}
	});
}

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class DataGridColumnBondBase<T = unknown> extends Bond<DataGridColumnBondProps> {
	readonly #parent: IDataGrid<T>;

	constructor(props: DataGridColumnBondProps) {
		super(props, 'datagrid-column');
		const datagrid = DataGridBond.get() as DataGridBond<T> | undefined;
		if (!datagrid) {
			throw new Error('DataGridColumnBond must be used within a DataGridBond context.');
		}
		this.#parent = datagrid;
		this.capability(rowColumnCellLink());
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

	mount(): () => void {
		return this.#parent.mountColumn(this.id, this);
	}

	asc(): void {
		this.props.direction = 'asc';
	}

	desc(): void {
		this.props.direction = 'desc';
	}
}

// DataGridColumnBond via defineBond over DataGridColumnBondBase; T carried by state/datagrid via generic facade.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const DataGridColumnBondImpl = defineBond<
	{ root: typeof DataGridColumnRootAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof DataGridColumnBondBase
>({
	name: 'datagrid-column',
	base: DataGridColumnBondBase,
	atoms: { root: DataGridColumnRootAtom }
});

// Generic instance type — intersect to preserve Bond brand; narrows state/datagrid to carry T.

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridColumnBond<T = unknown> = BondOf<typeof DataGridColumnBondImpl> & {
	readonly __props?: DataGridColumnBondProps;
	readonly datagrid: IDataGrid<T>;
	readonly id: string;
	readonly isSortable: boolean | SortableType | undefined;
	asc(): void;
	desc(): void;
};

// Generic-constructor facade over the non-generic impl.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

interface DataGridColumnBondConstructor {
	new <T = unknown>(props: DataGridColumnBondProps): DataGridColumnBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): DataGridColumnBond<T> | undefined;
	set<T = unknown>(bond: DataGridColumnBond<T>): DataGridColumnBond<T>;
	create<T = unknown>(props: DataGridColumnBondProps): DataGridColumnBond<T>;
}

export const DataGridColumnBond =
	DataGridColumnBondImpl as unknown as DataGridColumnBondConstructor;

// Backward-compatible aliases for existing imports.
export type DataGridThBondProps = DataGridColumnBondProps;
export type DataGridThElements = DataGridColumnElements;
export { DataGridColumnBond as DataGridThBond };
