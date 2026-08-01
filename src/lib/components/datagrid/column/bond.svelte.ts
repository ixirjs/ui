import type { Direction, SortableType } from '$ixirjs/ui/types';
import { internCapabilityFactory } from '$ixirjs/ui/shared/capability/intern';
import { DataGridBond, type IDataGrid } from '$ixirjs/ui/components/datagrid/bond.svelte';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '@ixirjs/ui/shared';
import { specializeDefinition } from '$ixirjs/ui/shared/authoring/metadata';
import { rowColumnCellLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$ixirjs/ui/shared/capability';

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

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DataGridColumnBondView = DataGridColumnBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const DATAGRID_COLUMN_ROOT = sharedCapabilityKey<void>({
	owner: '@ixirjs/datagrid-column',
	name: 'root',
	version: 1
});

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

const datagridColumnPresentation = internCapabilityFactory(function datagridColumnPresentation() {
	return defineAtomCapability<void, AtomHost, DataGridColumnBondView>({
		slot: DATAGRID_COLUMN_ROOT,
		meta: {
			projects: ['root'],
			docs: 'Datagrid column identity, sortable, and direction projection.'
		},
		attach: {
			attrs: (_node, bond) => {
				const props = bond?.props;

				return {
					'data-sortable': props?.sortable ? 'true' : undefined,
					'data-direction': props?.direction
				};
			}
		}
	});
});

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

const DataGridColumnBondDefinition = defineBond({
	name: 'datagrid-column',
	base: DataGridColumnBondBase,
	atoms: { root: DataGridColumnRootAtom }
});

// Generic instance type — intersect to preserve Bond brand; narrows state/datagrid to carry T.

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridColumnBond<T = unknown> = BondOf<typeof DataGridColumnBondDefinition> & {
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

// TS cannot retain a class value's type parameter through `typeof DataGridColumnBondDefinition`; this
// minimal static facade preserves generic construction and context lookup ergonomics.
interface DataGridColumnBondGenericFacade {
	new <T = unknown>(props: DataGridColumnBondProps): DataGridColumnBond<T>;
	get<T = unknown>(): DataGridColumnBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): DataGridColumnBond<T>;
	optional<T = unknown>(): DataGridColumnBond<T> | undefined;
	required<T = unknown>(message?: string): DataGridColumnBond<T>;
	set<T = unknown>(bond: DataGridColumnBond<T>): DataGridColumnBond<T>;
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
