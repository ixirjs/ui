import {
	DropdownMenuBond,
	DropdownMenuBondBase,
	DropdownMenuContentAtom,
	type DropdownMenuBondElements,
	type DropdownMenuBondProps
} from '$svelte-atoms/core/components/dropdown-menu/bond.svelte';
import { closeOverlay } from '$svelte-atoms/core/components/portal/host/policies/overlay-view';
import { defineAtom } from '$svelte-atoms/core/shared/bond';
import {
	ariaRole,
	defineBond,
	createInput,
	inputCapability,
	defineAtomCapability,
	sharedCapabilityKey,
	type BondOf,
	type BondSpec,
	type AtomHost
} from '$svelte-atoms/core/shared';
import {
	createSelection,
	selectionCapability,
	type SelectionModel
} from '$svelte-atoms/core/shared/capability/models/selection.svelte';
import { clickTrigger, clearThenClose } from '$svelte-atoms/core/components/portal/host';
import type { SelectItemAtom } from './item/bond.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type SelectStateProps = DropdownMenuBondProps & {
	values?: string[];
	value?: string;
	labels?: string[];
	label?: string;
	multiple?: boolean;
	keys?: string[];
	// Reactive search/filter text; read/written by `createBondFilter` and bound to the `'input'` capability's `query` target.
	query?: string;
};

export type SelectBondElements = DropdownMenuBondElements & {
	placeholder?: HTMLElement;
};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class SelectBondBase<
	Props extends SelectStateProps = SelectStateProps,
	ItemData = unknown
> extends DropdownMenuBondBase<Props> {
	// Items live in the inherited `'item'` Collection, keyed by value — roving and `aria-activedescendant` resolve from it.
	#selections = $derived(
		(this.props.values?.map((value) => this.items.get(value)).filter(Boolean) ??
			[]) as unknown as SelectItemAtom<ItemData>[]
	);

	// Selection model (single/multiple via `props.multiple`); storage in `props.values`, label derivation stays on the bond.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values ?? [],
		set: (v) => (this.props.values = v),
		mode: () => (this.props.multiple ? 'multiple' : 'single')
	});

	constructor(props: Props, name = 'select') {
		super(props, name);
		// Option selection reflection (role:'item'): aria-selected + data-selected only.
		// `interactive: false` — the item keeps its own click (select + close).
		this.capability(selectionCapability(this.#selection, { interactive: false }));
		// Filter input (role 'input'/'query'): text is the bond-owned `query` prop (the
		// `createBondFilter` source). Filter-only — no `value` field; Combobox adds one (last-wins).
		this.capability(
			inputCapability(
				createInput({
					query: { get: () => this.props.query ?? '', set: (v) => (this.props.query = v) }
				}),
				{
					itemDomId: (id) => this.itemDomId(id),
					expanded: () => this.isOpen,
					disabled: () => this.isDisabled
				}
			)
		);
	}

	get selection() {
		return this.#selection;
	}

	get selections() {
		return this.#selections;
	}

	// Resolves active value → `select-item-${item.id}` DOM id for `aria-activedescendant`.
	protected override itemDomId(value: string): string {
		const item = this.items.get(value) as SelectItemAtom<ItemData> | undefined;
		return item ? `select-item-${item.id}` : `select-item-${value}`;
	}

	select(ids: string[]) {
		this.#selection.select(ids);
		this.updateLabels();
	}

	unselect(ids: string[]) {
		this.#selection.deselect(ids);
		this.updateLabels();
	}

	protected updateLabels() {
		const labels = this.#selections.map((s) => s.label);
		this.props.labels = labels;
		this.props.label = labels[0] ?? '';
	}
}

// What the select atoms type `this.bond` against.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type SelectBondView = SelectBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const SELECT_CONTENT = sharedCapabilityKey<void>('@svelte-atoms/select:content');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class SelectContentAtom extends DropdownMenuContentAtom<SelectBondView> {
	declare protected bond: SelectBondView;

	constructor(bond: SelectBondView) {
		super(bond);
		this.capability(selectContentPresentation());
	}

	// `role=listbox` (vs the menu's `'menu'`) via the overridable getter — keeps `attrs`
	// LSP-compatible with the base.
	protected override get contentRole() {
		return 'listbox';
	}
}

export const SelectPlaceholderAtom = defineAtom<SelectBondView, HTMLElement>(
	'placeholder',
	(atom) => {
		atom.capability(ariaRole('group'));
	}
);
export type SelectPlaceholderAtom = InstanceType<typeof SelectPlaceholderAtom>;

// Backs the rendered selection display; exists mainly to own the `select.value` preset.

export const SelectValueAtom = defineAtom<SelectBondView, HTMLElement>('value');
export type SelectValueAtom = InstanceType<typeof SelectValueAtom>;

// Filter input atom (`Select.Query`): plays role `'input'/'query'`, projects combobox a11y via `inputCapability`, writes `props.query`.

export const SelectQueryAtom = defineAtom<SelectBondView, HTMLInputElement>('query', (atom) => {
	atom.role('input', 'query');
});
export type SelectQueryAtom = InstanceType<typeof SelectQueryAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function selectContentPresentation() {
	return defineAtomCapability<void, AtomHost, SelectBondView>({
		slot: SELECT_CONTENT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['content'],
			docs: 'Select content multi-select projection.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				// aria-activedescendant + orientation + role come from dropdown/roving.
				'aria-multiselectable': bond?.props.multiple ?? false
			})
		}
	});
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const selectSpec = {
	parts: [DropdownMenuBond],
	name: 'select',
	base: SelectBondBase,
	atoms: {
		content: { atom: SelectContentAtom, role: 'container' },
		placeholder: SelectPlaceholderAtom,
		value: SelectValueAtom,
		query: SelectQueryAtom
	},
	capabilities: () => [clickTrigger({ ariaHasPopup: 'listbox' }), clearThenClose]
} satisfies BondSpec<
	{
		content: { atom: typeof SelectContentAtom; role: 'container' };
		placeholder: typeof SelectPlaceholderAtom;
		value: typeof SelectValueAtom;
		query: typeof SelectQueryAtom;
	},
	typeof SelectBondBase
>;

// SelectBond — flat composition over `DropdownMenuBond`: listbox content, placeholder/value/query
// atoms, trigger `aria-haspopup='listbox'`, `ClearThenClose` clears query on Escape.
const SelectBondImpl = defineBond<
	{
		content: { atom: typeof SelectContentAtom; role: 'container' };
		placeholder: typeof SelectPlaceholderAtom;
		value: typeof SelectValueAtom;
		query: typeof SelectQueryAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof SelectBondBase
>(selectSpec);

// Instance type paired with the `const`; item-data precision lives on `SelectBondBase`/`SelectItemAtom` generics.
export type SelectBond<ItemData = unknown> = BondOf<typeof SelectBondImpl> &
	SelectBondBase<SelectStateProps, ItemData>;

interface SelectBondConstructor {
	new (props: SelectStateProps): SelectBond;
	readonly CONTEXT_KEY: string;
	readonly CONTEXT_KEYS?: readonly string[];
	readonly spec: (typeof SelectBondImpl)['spec'];
	get(): SelectBond | undefined;
	getOrThrow(message?: string): SelectBond;
	set(bond: SelectBond): SelectBond;
	create(props: SelectStateProps): SelectBond;
}

export const SelectBond = SelectBondImpl as unknown as SelectBondConstructor;

export { closeOverlay };
