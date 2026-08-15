import { partCapability } from '$ixirjs/ui/shared/capability';
import {
	DropdownMenuBond,
	DropdownMenuBondBase,
	DropdownMenuContentAtom,
	type DropdownMenuBondProps,
	type MenuItemSource
} from '$ixirjs/ui/components/dropdown-menu/bond.svelte';

import { closeOverlay } from '$ixirjs/ui/components/overlay/policies/overlay-view';
import { defineAtom } from '$ixirjs/ui/shared/bond';
import { lazyCapability } from '$ixirjs/ui/shared/capability/intern';
import { defineBond, createInput, inputCapability, type BondOf } from '$ixirjs/ui/shared';
import {
	createSelection,
	selectionCapability,
	type SelectionModel
} from '$ixirjs/ui/shared/capability/models/selection.svelte';
import { clickTrigger, clearThenClose } from '$ixirjs/ui/components/overlay';
import type { SelectItemAtom } from './item/bond.svelte';

export type SelectStateProps = DropdownMenuBondProps & {
	values?: string[];
	value?: string;
	labels?: string[];
	label?: string;
	multiple?: boolean;
	keys?: string[];
	// Reactive search/filter text; read by `filterSelectData` and bound to the `'input'` capability's `query` target.
	query?: string;
	/**
	 * The full ordered option data. Supplying it moves roving, typeahead and label resolution off the
	 * mounted Collection — which under virtualization holds only the rendered window — and onto the
	 * data. Omit it and all three read the Collection as before.
	 */
	options?: readonly unknown[] | undefined;
	// `never`, not `unknown`: declared on an untyped Bond but assigned from a component that knows its
	// option type, and under `strictFunctionTypes` only `never` accepts a handler for any concrete
	// type. The component's props carry the real signature; call sites below re-widen with a cast.
	/** Stable, unique value per option. Required alongside `options`. */
	optionValue?: ((option: never, index: number) => string) | undefined;
	/** Display and typeahead text per option. */
	optionLabel?: ((option: never, index: number) => string) | undefined;
};

export class SelectBondBase<
	Props extends SelectStateProps = SelectStateProps,
	ItemData = unknown
> extends DropdownMenuBondBase<Props> {
	// Items live in the inherited `'item'` Collection, keyed by value — roving and `aria-activedescendant` resolve from it.
	// One pass. The map/filter chain allocated a full-length array of possibly-missing items before
	// discarding the gaps, and `filter(Boolean)` does not narrow, which is what forced the double
	// cast; resolving inside the loop keeps the type honest.
	#selections = $derived.by(() => {
		const values = this.props.values;
		if (!values?.length) return [] as SelectItemAtom<ItemData>[];
		const selections: SelectItemAtom<ItemData>[] = [];
		for (let index = 0; index < values.length; index++) {
			const item = this.items.get(values[index]!) as SelectItemAtom<ItemData> | undefined;
			if (item) selections.push(item);
		}
		return selections;
	});

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
		// `filterSelectData` source). Filter-only — no `value` field; Combobox adds one (last-wins).
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

	// Derived once per data change: roving memoises its index lookup against the identity of the array
	// `ids()` returns, so rebuilding per read puts an O(n) scan back on every rendered item.
	#optionValues = $derived.by(() => {
		const options = this.props.options;
		if (!options) return undefined;
		const value = this.props.optionValue;
		return options.map((option, index) => (value ? value(option as never, index) : String(index)));
	});

	#optionIndexes = $derived.by(() => {
		const values = this.#optionValues;
		if (!values) return undefined;
		const indexes = new Map<string, number>();
		for (let index = 0; index < values.length; index++) indexes.set(values[index]!, index);
		return indexes;
	});

	// No item object: an option outside the window has no Atom, and `itemText` answers from the data
	// by id anyway. `defaultDisabled` therefore sees `undefined` and reports false — a disabled option
	// is still skipped on click, but not while typing. The one behaviour data mode drops.
	#optionEntries = $derived.by(() => {
		const values = this.#optionValues;
		return values?.map((value) => [value, undefined] as const);
	});

	// Three thunks rather than the Bond, so the state above stays private instead of becoming three
	// `@internal` members on the public surface with no reader outside this file.
	#dataSource: MenuItemSource = optionSource(
		() => this.#optionValues ?? [],
		() => this.#optionEntries ?? [],
		(value) => this.#optionIndexes?.get(value) ?? -1
	);

	override get navigableItems(): MenuItemSource {
		return this.props.options ? this.#dataSource : super.navigableItems;
	}

	/** The data's label for a value that may have no mounted item. Named apart from the `optionLabel` prop it reads. */
	#labelOf(value: string): string | undefined {
		const index = this.#optionIndexes?.get(value);
		if (index === undefined) return undefined;
		const label = this.props.optionLabel;
		return label ? label(this.props.options![index] as never, index) : undefined;
	}

	protected override itemText(_item: unknown, id: string): string | undefined | null {
		return this.props.options ? this.#labelOf(id) : undefined;
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
		// Collection-backed: labels come from the mounted selected items; an unmounted one is absent.
		if (!this.props.options) {
			const labels = this.#selections.map((s) => s.label);
			this.props.labels = labels;
			this.props.label = labels[0] ?? '';
			return;
		}
		// Data-backed: a selection scrolled out of the window has no Atom, so read the data first and
		// fall back to the mounted item only when the data has no answer.
		const labels = (this.props.values ?? []).map(
			(value) =>
				this.#labelOf(value) ??
				(this.items.get(value) as SelectItemAtom<ItemData> | undefined)?.label ??
				''
		);
		this.props.labels = labels;
		this.props.label = labels[0] ?? '';
	}
}

/**
 * Outside the class because `entries`/`keys` must stay getters — typeahead and the roving backing
 * hold this object and read through it — and inside an object literal `this` is the literal.
 */
function optionSource(
	keys: () => readonly string[],
	entries: () => readonly (readonly [string, undefined])[],
	indexOf: (value: string) => number
): MenuItemSource {
	return {
		get keys() {
			return keys();
		},
		get entries() {
			return entries();
		},
		indexOf
	};
}

// What the select atoms type `this.bond` against.

export class SelectContentAtom extends DropdownMenuContentAtom<SelectBondBase> {
	declare protected bond: SelectBondBase;

	constructor(bond: SelectBondBase) {
		super(bond);
		this.capability(selectContentPresentation());
	}

	// `role=listbox` (vs the menu's `'menu'`) via the overridable getter — keeps `attrs`
	// LSP-compatible with the base.
	protected override get contentRole() {
		return 'listbox';
	}
}

export const SelectPlaceholderAtom = defineAtom<SelectBondBase, HTMLElement>('placeholder', {
	role: 'group'
});

// Backs the rendered selection display; exists mainly to own the `select.value` preset.

const SelectValueAtom = defineAtom<SelectBondBase, HTMLElement>('value');

// Filter input atom (`Select.Query`): plays role `'input'/'query'`, projects combobox a11y via `inputCapability`, writes `props.query`.

export const SelectQueryAtom = defineAtom<SelectBondBase, HTMLInputElement>('query', (atom) => {
	atom.role('input', 'query');
});

const selectContentPresentation = lazyCapability(() =>
	partCapability<SelectBondBase>(
		'@ixirjs/select:content',
		'content',
		'Select content multi-select projection.',
		{
			attrs: (_node, bond) => ({
				// aria-activedescendant + orientation + role come from dropdown/roving.
				'aria-multiselectable': bond?.props.multiple ?? false
			})
		}
	)
);

// SelectBond — flat composition over `DropdownMenuBond`: listbox content, placeholder/value/query
// atoms, trigger `aria-haspopup='listbox'`, `ClearThenClose` clears query on Escape.
// Inlined deliberately: `defineBond<const S>` infers `parts` as a tuple only from a literal
// argument. A hoisted spec widens it to an array, which makes `AtomsOf` resolve every inherited
// slot to `never` and blocks `Kernel.part` on slots the runtime spec merge does provide.
export const SelectBond = defineBond({
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
});

// Instance type paired with the `const`; item-data precision lives on `SelectBondBase`/`SelectItemAtom` generics.
export type SelectBond<ItemData = unknown> = BondOf<typeof SelectBond> &
	SelectBondBase<SelectStateProps, ItemData>;

export { closeOverlay };
