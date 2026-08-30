/**
 * Select's shared object on the redesigned `Kernel` — a plain state class over DropdownMenu.
 *
 * What the capabilities used to project is written here as ordinary state and read literally by the
 * parts: `createSelection` owns the committed values, the data-backed `navigableItems` moves roving
 * and typeahead off the mounted registration map when `options` is supplied, and `onEscape` is the
 * `ClearThenClose` policy — the first Escape empties the filter query, the second closes.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	DropdownMenuBondBase,
	menuSource,
	type DropdownMenuBondProps,
	type DropdownMenuItem,
	type MenuItemSource
} from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import {
	createSelection,
	type SelectionModel
} from '$ixirjs/ui/capability/models/selection.svelte';
import type { OverlayKnobs, OverlayLike } from '$ixirjs/ui/components/overlay/model.svelte';
import type { SelectItemAtom } from './item/bond.svelte';
import type { SelectPresets } from './types';

export type SelectStateProps = DropdownMenuBondProps & {
	values?: string[];
	value?: string;
	// `| undefined` on both: a root's live-props object exposes them as get/set pairs, and under
	// `exactOptionalPropertyTypes` the setter's parameter has to admit the getter's own type.
	labels?: string[] | undefined;
	label?: string | undefined;
	multiple?: boolean;
	keys?: string[];
	// Reactive search/filter text; read by `filterSelectData` and bound to `Select.Query`.
	query?: string;
	/**
	 * The full ordered option data. Supplying it moves roving, typeahead and label resolution off the
	 * mounted registration map — which under virtualization holds only the rendered window — and onto
	 * the data. Omit it and all three read the map as before.
	 */
	options?: readonly unknown[] | undefined;
	// `never`, not `unknown`: declared on an untyped Bond but assigned from a component that knows its
	// option type, and under `strictFunctionTypes` only `never` accepts a handler for any concrete
	// type. The component's props carry the real signature; call sites below re-widen with a cast.
	/** Stable, unique value per option. Required alongside `options`. */
	optionValue?: ((option: never, index: number) => string) | undefined;
	/** Display and typeahead text per option. */
	optionLabel?: ((option: never, index: number) => string) | undefined;
	presets?: SelectPresets | undefined;
};

export const SelectContext = Kernel.context<SelectBondBase>('bond/select');

export class SelectBondBase<
	Props extends SelectStateProps = SelectStateProps,
	ItemData = unknown
> extends DropdownMenuBondBase<Props> {
	// Items live in the inherited registration map, keyed by value — roving and
	// `aria-activedescendant` resolve from it. One pass: resolving inside the loop keeps the type
	// honest where a map/filter chain needed a double cast.
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

	// Selection model (single/multiple via `props.multiple`); storage in `props.values`, label
	// derivation stays on the bond.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values ?? [],
		set: (v) => (this.props.values = v),
		mode: () => (this.props.multiple ? 'multiple' : 'single'),
		// Bond props are reactive cells, so the membership index is sound here.
		indexed: true
	});

	constructor(props: Props, name = 'select') {
		super(props, name);
	}

	override get ariaHasPopup(): OverlayKnobs['ariaHasPopup'] {
		return 'listbox';
	}

	override get contentRole(): string {
		return 'listbox';
	}

	override get contentAttrs(): Record<string, unknown> {
		return {
			...super.contentAttrs,
			'aria-multiselectable': this.props.multiple ?? false
		};
	}

	/** `ClearThenClose`: the first Escape empties the filter query, the second closes. */
	override onEscape(event: KeyboardEvent): void {
		if (this.props.query) {
			this.props.query = '';
			return;
		}
		super.onEscape(event);
	}

	get selection() {
		return this.#selection;
	}

	get selections() {
		return this.#selections;
	}

	// Derived once per data change: roving memoises its index lookup against the identity of the
	// array `ids()` returns, so rebuilding per read puts an O(n) scan back on every rendered item.
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

	// No item object: an option outside the window has no rendered item, and `itemText` answers from
	// the data by id anyway. Typeahead's `defaultDisabled` therefore sees `undefined` and reports
	// false — a disabled option is still skipped on click, but not while typing.
	#optionEntries = $derived.by(() => {
		const values = this.#optionValues;
		return values?.map((value) => [value, undefined] as const);
	});

	#dataSource: MenuItemSource = menuSource(
		() => this.#optionValues ?? [],
		() => this.#optionEntries ?? [],
		(value) => this.#optionIndexes?.get(value) ?? -1
	);

	override get navigableItems(): MenuItemSource {
		return this.props.options ? this.#dataSource : super.navigableItems;
	}

	/** The data's label for a value that may have no mounted item. */
	#labelOf(value: string): string | undefined {
		const index = this.#optionIndexes?.get(value);
		if (index === undefined) return undefined;
		const label = this.props.optionLabel;
		return label ? label(this.props.options![index] as never, index) : undefined;
	}

	override itemText(_item: DropdownMenuItem | undefined, id: string): string | undefined | null {
		return this.props.options ? this.#labelOf(id) : undefined;
	}

	// Resolves the active value → `select-item-${item.id}` DOM id for `aria-activedescendant`.
	override itemDomId(value: string): string {
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
		// Map-backed: labels come from the mounted selected items; an unmounted one is absent.
		if (!this.props.options) {
			const labels = this.#selections.map((s) => s.label);
			this.props.labels = labels;
			this.props.label = labels[0] ?? '';
			return;
		}
		// Data-backed: a selection scrolled out of the window has no rendered item, so read the data
		// first and fall back to the mounted item only when the data has no answer.
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

export class SelectBond extends SelectBondBase {
	static override create(props: SelectStateProps): SelectBond;
	static override create(outer?: OverlayLike): SelectBond;
	static override create(props?: SelectStateProps | OverlayLike): SelectBond {
		return new SelectBond(props as SelectStateProps);
	}
}
