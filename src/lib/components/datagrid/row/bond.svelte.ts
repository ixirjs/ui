import { Atom, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { specializeDefinition } from '$ixirjs/ui/shared/authoring/metadata';
import { DataGridBond, type IDataGrid } from '$ixirjs/ui/components/datagrid/bond.svelte';
import { getDatagridHeaderContext } from '$ixirjs/ui/components/datagrid/context';
import { rowColumnCellLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type DataGridRowBondProps<T = unknown> = BondStateProps & {
	value?: string;
	data?: T;
};

// Row identity/header attrs are intrinsic to this Atom, not an optional capability. Keeping them
// here avoids allocating and sorting an Atom capability runtime for every collection row.
export class DataGridRowRootAtom extends Atom<DataGridRowBondBase, HTMLElement> {
	constructor(bond: DataGridRowBondBase) {
		super(bond, 'root');
		this.role('row');
		// Project selection a11y (role:'item') onto data rows only — header rows are not selectable.
		if (!bond.isHeader) this.role('item', bond.id);
	}

	override get attrs() {
		return {
			...super.attrs,
			// aria-selected + data-selected come from the datagrid's selection capability (role:'item').
			'data-header': this.bond?.isHeader ? 'true' : undefined
		};
	}
}

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

	select(context?: Pick<StateChangeContext, 'event'>): void {
		this.#parent.select([this.id], context);
	}

	unselect(context?: Pick<StateChangeContext, 'event'>): void {
		this.#parent.unselect([this.id], context);
	}
}

// DataGridRowBond via defineBond over DataGridRowBondBase; T carried by state/datagrid via generic facade.

const DataGridRowBondDefinition = defineBond({
	name: 'datagrid-row',
	base: DataGridRowBondBase,
	atoms: { root: DataGridRowRootAtom }
});

// Generic instance type — intersect to preserve Bond brand; narrows state/datagrid to carry T.

export type DataGridRowBond<
	T = unknown,
	Props extends DataGridRowBondProps<T> = DataGridRowBondProps<T>
> = BondOf<typeof DataGridRowBondDefinition> & {
	readonly __props?: Props;
	readonly props: Props;
	readonly datagrid: IDataGrid<T>;
	readonly id: string;
	readonly isSelected: boolean;
	readonly isHeader: boolean;
	select(context?: Pick<StateChangeContext, 'event'>): void;
	unselect(context?: Pick<StateChangeContext, 'event'>): void;
};

// Generic-constructor facade over the non-generic impl.

// TS cannot retain a class value's type parameter through `typeof DataGridRowBondDefinition`; this
// minimal static facade preserves generic construction and context lookup ergonomics.
interface DataGridRowBondGenericFacade {
	new <T = unknown>(props: DataGridRowBondProps<T>): DataGridRowBond<T>;
	get<T = unknown>(): DataGridRowBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): DataGridRowBond<T>;
	create<T = unknown>(props: DataGridRowBondProps<T>): DataGridRowBond<T>;
}

// Replace only generic-sensitive signatures. The mapped original retains defineBond's
// untouched statics and definition phantom metadata while dropping its construct signature.
type DataGridRowBondConstructor = Omit<
	typeof DataGridRowBondDefinition,
	keyof DataGridRowBondGenericFacade
> &
	DataGridRowBondGenericFacade;

export const DataGridRowBond =
	specializeDefinition<DataGridRowBondConstructor>(DataGridRowBondDefinition);
