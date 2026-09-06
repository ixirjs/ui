import type { ComputePositionReturn, VirtualElement } from '@floating-ui/dom';
import { onDestroy } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { generateId } from '$ixirjs/ui/authoring';
import {
	createInput,
	createRovingFocus,
	createSelection,
	createTypeahead
} from '$ixirjs/ui/capability';
import {
	menuSource,
	type DropdownMenuItem,
	type MenuItemSource
} from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import type { OverlayPart, OverlayOpenChange } from '$ixirjs/ui/components/overlay/model.svelte';
import type { PopoverBondBase } from '$ixirjs/ui/components/popover/bond.svelte';
import type { DismissPressEvent } from '$ixirjs/ui/components/overlay/behavior.svelte';
import type { SelectStateProps } from '$ixirjs/ui/components/select/bond.svelte';
import type { SelectItemAtom } from '$ixirjs/ui/components/select/item/bond.svelte';
import type { ComboboxSelection } from '$ixirjs/ui/components/combobox/types';
import type { DatePickerBondProps } from '$ixirjs/ui/components/date-picker/bond.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';
import { createDateState } from './date.svelte';
import { profiles, type PopupFamily, type PopupProfile } from './profiles';
import type { PopupProps, PopupBonds } from './types';

function createPositionState() {
	let position = $state<ComputePositionReturn>();
	let resolve!: (value: ComputePositionReturn) => void;
	const next = () =>
		new Promise<ComputePositionReturn>((done) => {
			resolve = done;
		});
	let computed = next();
	return {
		get position() {
			return position;
		},
		set position(value: ComputePositionReturn | undefined) {
			position = value;
		},
		get computed() {
			return computed;
		},
		set computed(value: Promise<ComputePositionReturn>) {
			computed = value;
		},
		notifyComputed(value: ComputePositionReturn) {
			position = value;
			resolve(value);
			computed = next();
		}
	};
}

/** The collection accepts the existing element-shaped item seam, including markup-only items. */
function createCollection(owner: {
	navigableItems: MenuItemSource;
	isOpen: boolean;
	isDisabled: boolean;
	itemText(item: DropdownMenuItem | undefined, id: string): string | undefined | null;
}) {
	const items = new SvelteMap<string, DropdownMenuItem>();
	const keys = $derived([...items.keys()]);
	const entries = $derived([...items.entries()]);
	const indexes = $derived(new Map(keys.map((id, index) => [id, index])));
	const source = menuSource(
		() => keys,
		() => entries,
		(id) => indexes.get(id) ?? -1
	);
	const roving = createRovingFocus<DropdownMenuItem>({
		ids: () => owner.navigableItems.keys,
		item: (id) => items.get(id)
	});
	const typeahead = createTypeahead(
		menuSource(
			() => owner.navigableItems.keys,
			() => owner.navigableItems.entries,
			(id) => owner.navigableItems.indexOf(id)
		),
		roving,
		{
			enabled: () => owner.isOpen && !owner.isDisabled,
			text: (item, id) => owner.itemText(item, id)
		}
	);
	return { items, source, roving, typeahead };
}

function createSelectionState(props: SelectStateProps, items: SvelteMap<string, DropdownMenuItem>) {
	const selections = $derived.by(() => {
		const result: SelectItemAtom[] = [];
		for (const value of props.values ?? []) {
			const item = items.get(value);
			// The selected-item seam is supplied by Select/Combobox parts, not menu parts.
			if (item) result.push(item as SelectItemAtom);
		}
		return result;
	});
	const values = $derived(
		props.options?.map((option, index) =>
			props.optionValue ? props.optionValue(option as never, index) : String(index)
		)
	);
	const indexes = $derived(
		values ? new Map(values.map((value, index) => [value, index])) : undefined
	);
	const entries = $derived(values?.map((value) => [value, undefined] as const));
	const source = menuSource(
		() => values ?? [],
		() => entries ?? [],
		(id) => indexes?.get(id) ?? -1
	);
	const selection = createSelection<string>({
		get: () => props.values ?? [],
		set: (next) => {
			props.values = next;
		},
		mode: () => (props.multiple ? 'multiple' : 'single'),
		indexed: true
	});
	function labelOf(value: string): string | undefined {
		const index = indexes?.get(value);
		return index === undefined
			? undefined
			: props.optionLabel?.(props.options![index] as never, index);
	}
	return {
		selection,
		source,
		labelOf,
		get selections() {
			return selections;
		},
		labels() {
			if (!props.options) return selections.map((item) => item.label);
			return (props.values ?? []).map(
				(value) => labelOf(value) ?? (items.get(value) as SelectItemAtom | undefined)?.label ?? ''
			);
		}
	};
}

/** One runtime implementation for all eight families; no family-specific subclass. */
export class PopupBond<F extends PopupFamily = PopupFamily> {
	readonly props: PopupProps[F];
	readonly profile: Readonly<PopupProfile>;
	readonly name: string;
	readonly ids = $state<Partial<Record<OverlayPart, string>>>({});
	#commit: ((next: boolean, context: StateChangeContext<never>) => void) | undefined;
	#staged: OverlayOpenChange | undefined;
	#disposed = false;
	readonly #position: ReturnType<typeof createPositionState> | undefined;
	readonly #collection: ReturnType<typeof createCollection> | undefined;
	readonly #selected: ReturnType<typeof createSelectionState> | undefined;
	readonly #input: ReturnType<typeof createInput> | undefined;
	readonly #custom: SvelteMap<string, ComboboxSelection> | undefined;
	readonly #dates: ReturnType<typeof createDateState> | undefined;
	tracking = $state<boolean | undefined>();
	virtualElement = $state<VirtualElement | undefined>();
	onclickoutside: ((event: DismissPressEvent, bond: PopoverBondBase) => void) | undefined;

	private constructor(family: F, props: NoInfer<PopupProps[F]>) {
		this.profile = profiles[family];
		this.name = this.profile.name;
		this.props = props;
		if (this.profile.positioned) this.#position = createPositionState();
		if (this.profile.collection) this.#collection = createCollection(this);
		// These internal casts are selected by the typed profile factory, never by authoring callers.
		const selectionProps = props as unknown as SelectStateProps;
		if (this.profile.selection) this.#selected = createSelectionState(selectionProps, this.items);
		if (this.profile.customSelections) {
			this.#custom = new SvelteMap();
			this.#input = createInput({
				query: {
					get: () => selectionProps.query ?? '',
					set: (value) => {
						selectionProps.query = value;
					}
				},
				value: {
					get: () => selectionProps.values?.[0] ?? '',
					set: (value) => this.selection.select(value ? [value] : [])
				}
			});
		}
		if (this.profile.dates)
			this.#dates = createDateState(
				props as unknown as DatePickerBondProps,
				() => this.close(),
				(date) => this.formatDate(date)
			);
	}

	static create<F extends PopupFamily>(family: F, props: NoInfer<PopupProps[F]>): PopupBonds[F] {
		// Profiles choose the supported public view; implementation shape checks cover every family.
		return new PopupBond(family, props) as PopupBonds[F];
	}

	/** Component-init construction: one owner registers capability teardown. */
	static mount<F extends PopupFamily>(family: F, props: NoInfer<PopupProps[F]>): PopupBonds[F] {
		const bond = PopupBond.create(family, props);
		onDestroy(() => bond.dispose());
		return bond;
	}

	bindCommit(commit: (next: boolean, context: StateChangeContext<this>) => void) {
		this.#commit = commit;
	}
	dispose() {
		this.#disposed = true;
		this.#staged = undefined;
		this.#collection?.typeahead.destroy();
		this.#collection?.items.clear();
	}
	get id() {
		return this.props.id ?? this.name;
	}
	get isOpen() {
		return this.props.open ?? false;
	}
	get isDisabled() {
		return this.props.disabled ?? false;
	}
	get modal() {
		return this.props.modal ?? true;
	}
	open() {
		if (!this.isDisabled) this.#setOpen(true);
	}
	close() {
		this.#setOpen(false);
	}
	toggle() {
		if (this.isOpen) this.close();
		else this.open();
	}
	#setOpen(open: boolean) {
		if (this.#disposed || open === this.isOpen) return;
		if (this.#commit)
			this.#commit(open, {
				...this.takeOpenChangeContext(),
				bond: this
			} as StateChangeContext<never>);
		else this.props.open = open;
	}
	stageOpenChange(context: OverlayOpenChange) {
		if (this.#disposed) return;
		this.#staged = context;
		queueMicrotask(() => {
			if (this.#staged === context) this.#staged = undefined;
		});
	}
	takeOpenChangeContext(): OverlayOpenChange {
		const context = this.#staged ?? {};
		this.#staged = undefined;
		return context;
	}
	attachPart(part: OverlayPart, id: string) {
		this.ids[part] = id;
		return () => {
			if (this.ids[part] === id) delete this.ids[part];
		};
	}
	partId(part: OverlayPart) {
		return this.ids[part];
	}
	element(part: OverlayPart): HTMLElement | null {
		const id = this.ids[part];
		return id !== undefined && typeof document !== 'undefined' ? document.getElementById(id) : null;
	}
	get position() {
		return this.#position?.position;
	}
	set position(value: ComputePositionReturn | undefined) {
		if (this.#position) this.#position.position = value;
	}
	get computed() {
		if (!this.#position) throw new Error('No positioning capability');
		return this.#position.computed;
	}
	set computed(value: Promise<ComputePositionReturn>) {
		if (this.#position) this.#position.computed = value;
	}
	notifyComputed(value: ComputePositionReturn) {
		this.#position?.notifyComputed(value);
	}
	get shouldTrackPosition() {
		return this.tracking ?? this.isOpen;
	}
	get reference(): Element | VirtualElement | null {
		return this.profile.pointerAnchor
			? (this.virtualElement ?? this.element('trigger'))
			: this.element('trigger');
	}
	onEscape(event: KeyboardEvent) {
		const props = this.props as unknown as SelectStateProps;
		if (this.profile.query && props.query) {
			props.query = '';
			return;
		}
		this.stageOpenChange({ event, reason: 'escape' });
		this.close();
	}
	get ariaHasPopup() {
		return this.profile.popupRole;
	}
	get triggerToggles() {
		return this.profile.trigger !== 'context-menu';
	}
	get contentRole() {
		return this.profile.popupRole;
	}
	get contentAttrs(): Record<string, unknown> {
		const active = this.roving.activeId;
		return {
			role: this.contentRole,
			'aria-orientation': 'vertical',
			'aria-activedescendant': active === null ? undefined : this.itemDomId(active),
			...(this.profile.selection
				? { 'aria-multiselectable': (this.props as unknown as SelectStateProps).multiple ?? false }
				: {})
		};
	}
	get items() {
		if (!this.#collection) throw new Error('No collection capability');
		return this.#collection.items;
	}
	get roving() {
		if (!this.#collection) throw new Error('No navigation capability');
		return this.#collection.roving;
	}
	get typeahead() {
		if (!this.#collection) throw new Error('No typeahead capability');
		return this.#collection.typeahead;
	}
	get navigableItems(): MenuItemSource {
		if (this.#selected && (this.props as unknown as SelectStateProps).options)
			return this.#selected.source;
		if (!this.#collection) throw new Error('No collection capability');
		return this.#collection.source;
	}
	itemText(_item: DropdownMenuItem | undefined, id: string): string | undefined | null {
		return this.#selected && (this.props as unknown as SelectStateProps).options
			? this.#selected.labelOf(id)
			: undefined;
	}
	itemDomId(id: string): string {
		return this.profile.selection
			? `select-item-${this.items.get(id)?.id ?? id}`
			: `menu-item-${id}`;
	}
	registerItem(id: string, item: DropdownMenuItem) {
		this.items.set(id, item);
		return () => {
			if (this.items.get(id) === item) this.items.delete(id);
		};
	}
	unregisterItem(id: string) {
		this.items.delete(id);
	}
	mountItem(id: string, item: DropdownMenuItem) {
		return this.registerItem(id, item);
	}
	unmountItem(id: string) {
		this.unregisterItem(id);
	}
	item(id: string) {
		return this.items.get(id);
	}
	get selection() {
		if (!this.#selected) throw new Error('No selection capability');
		return this.#selected.selection;
	}
	get selections() {
		if (!this.#selected) throw new Error('No selection capability');
		return this.#selected.selections;
	}
	get input() {
		if (!this.#input) throw new Error('No input capability');
		return this.#input;
	}
	select(ids: string[]) {
		this.selection.select(ids);
		this.updateLabels();
		const props = this.props as unknown as SelectStateProps;
		if (this.profile.customSelections && !props.multiple) props.query = ids[0] ?? '';
	}
	unselect(ids: string[]) {
		this.selection.deselect(ids);
		this.updateLabels();
		const props = this.props as unknown as SelectStateProps;
		if (this.profile.customSelections && !props.multiple) props.query = '';
	}
	protected updateLabels() {
		const props = this.props as unknown as SelectStateProps;
		const labels = this.#custom
			? this.allSelections.map((item) => item.label)
			: this.#selected!.labels();
		props.labels = labels;
		props.label = labels[0] ?? '';
	}
	get userSelections() {
		return [...(this.#custom?.values() ?? [])];
	}
	get allSelections() {
		const selected = this.selections.map((item) => ({
			id: item.id,
			label: item.label,
			createdAt: item.createdAt,
			controller: item,
			unselect: () => this.unselect([item.value])
		}));
		return [...selected, ...this.userSelections].sort(
			(a, b) => a.createdAt.getTime() - b.createdAt.getTime()
		);
	}
	addSelection(label: string) {
		if (!this.#custom) throw new Error('No custom selection capability');
		const id = generateId('combobox-selection');
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		this.#custom.set(id, {
			id,
			label,
			createdAt: new Date(),
			unselect: () => this.deleteSelection(id)
		});
		this.updateLabels();
	}
	deleteSelection(id: string) {
		this.#custom?.delete(id);
		this.updateLabels();
	}
	get formattedValue() {
		return this.#date().formattedValue;
	}
	get hasValue() {
		return this.#date().hasValue;
	}
	get isYearsPickerOpen() {
		return this.#date().isYearsPickerOpen;
	}
	get isMonthsPickerOpen() {
		return this.#date().isMonthsPickerOpen;
	}
	formatDate(date: Date) {
		return this.#date().formatDate(date);
	}
	selectDate(date: Date) {
		this.#date().selectDate(date);
	}
	selectStart(date: Date) {
		this.#date().selectStart(date);
	}
	selectEnd(date: Date) {
		this.#date().selectEnd(date);
	}
	clear() {
		this.#date().clear();
	}
	openYearsPicker() {
		this.#date().openYearsPicker();
	}
	closeYearsPicker() {
		this.#date().closeYearsPicker();
	}
	toggleYearsPicker() {
		this.#date().toggleYearsPicker();
	}
	openMonthsPicker() {
		this.#date().openMonthsPicker();
	}
	closeMonthsPicker() {
		this.#date().closeMonthsPicker();
	}
	toggleMonthsPicker() {
		this.#date().toggleMonthsPicker();
	}
	#date() {
		if (!this.#dates) throw new Error('No date capability');
		return this.#dates;
	}
}
