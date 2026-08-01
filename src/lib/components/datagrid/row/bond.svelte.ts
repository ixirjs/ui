import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import { DataGridBond, type IDataGrid } from '../bond.svelte';
import { getDatagridHeaderContext } from '../context';
import { rowColumnCellLink } from '$svelte-atoms/core/shared/capability/models/relationship.svelte';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridRowBondProps<T = unknown> = BondStateProps & {
	value?: string;
	data?: T;
};

export type DataGridRowBondElements = {
	root: HTMLElement;
};

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DataGridRowBondView = DataGridRowBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const DATAGRID_ROW_ROOT = sharedCapabilityKey<void>('@svelte-atoms/datagrid-row:root');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const DataGridRowRootAtom = defineAtom<DataGridRowBondView>('root', (atom, bond) => {
	atom.role('row');
	// Project selection a11y (role:'item') onto data rows only — header rows are not selectable.
	if (!bond.isHeader) atom.role('item', bond.id);
	atom.capability(datagridRowPresentation());
});
export type DataGridRowRootAtom = InstanceType<typeof DataGridRowRootAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function datagridRowPresentation() {
	return defineAtomCapability<void, AtomHost, DataGridRowBondView>({
		slot: DATAGRID_ROW_ROOT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['root'],
			docs: 'Datagrid row identity and header-state projection.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				// aria-selected + data-selected come from the datagrid's selection capability (role:'item').
				'data-header': bond?.isHeader ? 'true' : undefined
			})
		}
	});
}

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class DataGridRowBondBase<T = unknown> extends Bond<DataGridRowBondProps<T>> {
	readonly #parent: IDataGrid<T>;
	readonly #headerContext = getDatagridHeaderContext();

	constructor(props: DataGridRowBondProps<T>) {
		super(props, 'datagrid-row');
		const datagrid = DataGridBond.get() as DataGridBond<T> | undefined;
		if (!datagrid) throw new Error('DataGridRowBond must be used within a DataGridBond context.');
		this.#parent = datagrid;
		const selection = this.#parent.selectionCapability();
		if (selection) this.capability(selection);
		this.capability(rowColumnCellLink());
	}

	get datagrid(): IDataGrid<T> {
		return this.#parent;
	}

	// Preset namespace is datagrid.row (not the hyphenated DOM name datagrid-row).
	override get preset(): string {
		return 'datagrid.row';
	}

	get id(): string {
		return this.props.value ?? super.id;
	}

	get isSelected(): boolean {
		return this.#parent.isSelected(this.id);
	}

	get isHeader(): boolean {
		return this.#headerContext?.isHeader ?? false;
	}

	mount(): () => void {
		return this.#parent.mountRow(this.id, this);
	}

	select(): void {
		this.#parent.select([this.id]);
	}

	unselect(): void {
		this.#parent.unselect([this.id]);
	}
}

// DataGridRowBond via defineBond over DataGridRowBondBase; T carried by state/datagrid via generic facade.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const DataGridRowBondImpl = defineBond<
	{ root: typeof DataGridRowRootAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof DataGridRowBondBase
>({
	name: 'datagrid-row',
	base: DataGridRowBondBase,
	atoms: { root: DataGridRowRootAtom }
});

// Generic instance type — intersect to preserve Bond brand; narrows state/datagrid to carry T.

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DataGridRowBond<
	T = unknown,
	Props extends DataGridRowBondProps<T> = DataGridRowBondProps<T>
> = BondOf<typeof DataGridRowBondImpl> & {
	readonly __props?: Props;
	readonly props: Props;
	readonly datagrid: IDataGrid<T>;
	readonly id: string;
	readonly isSelected: boolean;
	readonly isHeader: boolean;
	select(): void;
	unselect(): void;
};

// Generic-constructor facade over the non-generic impl.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

interface DataGridRowBondConstructor {
	new <T = unknown>(props: DataGridRowBondProps<T>): DataGridRowBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): DataGridRowBond<T> | undefined;
	set<T = unknown>(bond: DataGridRowBond<T>): DataGridRowBond<T>;
	create<T = unknown>(props: DataGridRowBondProps<T>): DataGridRowBond<T>;
}

export const DataGridRowBond = DataGridRowBondImpl as unknown as DataGridRowBondConstructor;

// Backward-compatible aliases for existing imports.
export type DataGridTrBondProps<T = unknown> = DataGridRowBondProps<T>;
export type DataGridTrBondElements = DataGridRowBondElements;
export { DataGridRowBond as DataGridTrBond };
