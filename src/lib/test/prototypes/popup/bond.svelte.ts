import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import {
	createDisclosure,
	createInput,
	createRovingFocus,
	createSelection,
	createTypeahead,
	type Disclosure,
	type InputModel,
	type RovingFocus,
	type SelectionModel,
	type TypeaheadSurface
} from '$ixirjs/ui/capability';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { CollectionItemAtom } from './item';
import type {
	ComboboxBond,
	DropdownMenuBond,
	PopoverBond,
	PopupBonds,
	PopupChange,
	PopupOption,
	PopupPositioning,
	PopupProfile,
	PopupProps,
	SelectBond
} from './types';

/** Instantiated only by collection profiles. Children never rebuild the owner's option indexes. */
function optionSource(props: PopupProps) {
	const byValue = $derived.by(() => {
		const result = new Map<string, PopupOption>();
		for (const option of props.options ?? []) {
			if (result.has(option.value)) throw new Error(`Duplicate popup option: ${option.value}`);
			result.set(option.value, option);
		}
		return result;
	});
	const enabled = $derived(
		[...byValue.values()].filter((item) => !item.disabled).map((item) => item.value)
	);
	const entries = $derived([...byValue.entries()]);
	const indexes = $derived(new Map(entries.map(([value], index) => [value, index])));
	return {
		get: (value: string) => byValue.get(value),
		ids: () => enabled,
		get entries() {
			return entries;
		},
		indexOf: (value: string) => indexes.get(value) ?? -1
	};
}

/** The sole popup implementation. Family names below are interfaces, never subclasses. */
export class PopupBond implements ComboboxBond {
	readonly name: PopupProfile;
	readonly #props: PopupProps;
	readonly #disclosure: Disclosure;
	readonly positioning: PopupPositioning;
	readonly #source: ReturnType<typeof optionSource> | undefined;
	readonly #navigation: RovingFocus<PopupOption> | undefined;
	readonly #typeahead: TypeaheadSurface | undefined;
	readonly #selection: SelectionModel<string> | undefined;
	readonly #input: InputModel | undefined;
	readonly #items: Map<string, CollectionItemAtom> | undefined;
	#disposed = false;
	#mountedCount = $state(0);
	#change: PopupChange = {};

	private constructor(profile: PopupProfile, props: PopupProps) {
		this.name = profile;
		this.#props = props;
		this.#disclosure = createDisclosure({
			get: () => props.open,
			set: (next) => {
				if (next === props.open) return;
				props.open = next;
				if (props.open === next) props.onopenchange?.(next, { ...this.#change, bond: this });
			}
		});
		this.positioning = {
			compute: (reference, content) =>
				computePosition(reference, content, {
					placement: props.placement ?? 'bottom-start',
					middleware: [offset(props.offset ?? 2), flip(), shift()]
				})
		};
		if (profile !== 'popover') {
			this.#source = optionSource(props);
			this.#items = new Map();
			this.#navigation = createRovingFocus({
				ids: () => this.#source!.ids(),
				item: (value) => this.option(value)
			});
			this.#typeahead = createTypeahead(this.#source, this.#navigation, {
				enabled: () => this.isOpen && !this.isDisabled,
				text: (option) => option.label,
				disabled: (option) => Boolean(option.disabled)
			});
		}
		if (profile === 'select' || profile === 'combobox') {
			this.#selection = createSelection({
				get: () => props.values ?? [],
				set: (next) => this.#commitSelection(next),
				mode: () => (props.multiple ? 'multiple' : 'single'),
				// Prototype roots supply reactive getters, just like the shipped state classes.
				indexed: true
			});
		}
		if (profile === 'combobox') {
			this.#input = createInput({
				query: {
					get: () => props.query ?? '',
					set: (next) => {
						if (!this.isDisabled) props.query = next;
					}
				},
				value: {
					get: () => props.values?.[0] ?? '',
					set: (next) => this.selection.select(next ? [next] : [])
				}
			});
		}
	}

	static create<P extends PopupProfile>(profile: P, props: PopupProps): PopupBonds[P] {
		// Every interface is structurally checked against this one implementation. No casts.
		return new PopupBond(profile, props);
	}

	get id() {
		return this.#props.id;
	}
	get isOpen() {
		return this.#disclosure.isOpen;
	}
	get isDisabled() {
		return this.#disposed || (this.#props.disabled ?? false);
	}
	get mountedCount() {
		return this.#mountedCount;
	}
	get navigation(): RovingFocus<PopupOption> {
		if (!this.#navigation) throw new Error(`${this.name} has no navigation`);
		return this.#navigation;
	}
	get typeahead(): TypeaheadSurface {
		if (!this.#typeahead) throw new Error(`${this.name} has no typeahead`);
		return this.#typeahead;
	}
	get selection(): SelectionModel<string> {
		if (!this.#selection) throw new Error(`${this.name} has no selection`);
		return this.#selection;
	}
	get input(): InputModel {
		if (!this.#input) throw new Error(`${this.name} has no input`);
		return this.#input;
	}
	get labels(): readonly string[] {
		return this.selection.values.map((value) => this.option(value)?.label ?? value);
	}
	partId(part: string) {
		return Kernel.id(this.id, `${this.name}-${part}`);
	}
	itemId(value: string) {
		return this.partId(`item-${encodeURIComponent(value)}`);
	}
	option(value: string) {
		return this.#source?.get(value);
	}
	mountedItem(value: string) {
		return this.#items?.get(value);
	}

	open(change: PopupChange = {}) {
		if (!this.isDisabled) this.#run(this.#disclosure.open, change);
	}
	close(change: PopupChange = {}) {
		if (!this.#disposed) this.#run(this.#disclosure.close, change);
	}
	toggle(change: PopupChange = {}) {
		if (this.isOpen) this.close(change);
		else this.open(change);
	}
	escape(event: KeyboardEvent) {
		if (event.key !== 'Escape' || event.defaultPrevented || !this.isOpen || this.isDisabled) return;
		event.preventDefault();
		if (this.#input?.clear('query')) return;
		this.close({ event, reason: 'escape' });
	}

	dispose(): void {
		if (this.#disposed) return;
		this.#disposed = true;
		this.#typeahead?.destroy();
		for (const item of this.#items?.values() ?? []) item.dispose();
	}

	item(value: string): CollectionItemAtom {
		if (this.#disposed) throw new Error('Popup is disposed');
		if (!this.#items || !this.option(value)) throw new Error(`Unknown popup item: ${value}`);
		if (this.#items.has(value)) throw new Error(`Already mounted popup item: ${value}`);
		const item = new CollectionItemAtom(this, value, () => {
			if (this.#items?.get(value) !== item) return;
			this.#items.delete(value);
			this.#mountedCount = this.#items.size;
		});
		this.#items.set(value, item);
		this.#mountedCount = this.#items.size;
		return item;
	}

	activate(value: string, change: PopupChange = {}) {
		if (!this.#canActivate(value) || change.event?.defaultPrevented) return;
		if (this.#selection) {
			const expected = this.#props.multiple ? !this.selection.isSelected(value) : true;
			this.#run(
				() => (this.#props.multiple ? this.selection.toggle(value) : this.selection.select(value)),
				change
			);
			// A controlled owner can reject a write. Do not close after a rejected selection.
			if (this.selection.isSelected(value) !== expected) return;
		}
		this.#props.onactivate?.(value, { ...change, bond: this });
		if (!change.event?.defaultPrevented && (this.#props.closeOnSelect ?? !this.#props.multiple)) {
			this.close(change);
		}
	}
	select(value: string, change: PopupChange = {}) {
		if (this.#canActivate(value)) this.#run(() => this.selection.select(value), change);
	}
	unselect(value: string, change: PopupChange = {}) {
		this.#run(() => this.selection.deselect(value), change);
	}
	toggleSelection(value: string, change: PopupChange = {}) {
		if (this.#canActivate(value)) this.#run(() => this.selection.toggle(value), change);
	}
	#canActivate(value: string) {
		const option = this.option(value);
		return !this.isDisabled && option !== undefined && !option.disabled;
	}
	#commitSelection(next: string[]) {
		const current = this.#props.values ?? [];
		if (
			this.isDisabled ||
			(next.length === current.length && next.every((value, i) => value === current[i]))
		)
			return;
		// Even direct model calls route through the owner's validation and orchestration.
		if (next.some((value) => !current.includes(value) && !this.#canActivate(value))) return;
		this.#props.values = next;
		const committed = this.#props.values;
		if (committed.length !== next.length || committed.some((value, i) => value !== next[i])) return;
		if (this.#input && !this.#props.multiple) this.#input.set(committed[0] ?? '', 'query');
		this.#props.onvalueschange?.(committed, { ...this.#change, bond: this });
	}
	#run(command: () => void, change: PopupChange) {
		const previous = this.#change;
		this.#change = change;
		try {
			command();
		} finally {
			this.#change = previous;
		}
	}
}

/** Checked discovery when a consumer receives a common Bond interface. */
export function isDropdownMenuBond(bond: PopoverBond): bond is DropdownMenuBond {
	return bond.name !== 'popover';
}
export function isSelectBond(bond: PopoverBond): bond is SelectBond {
	return bond.name === 'select' || bond.name === 'combobox';
}
export function isComboboxBond(bond: PopoverBond): bond is ComboboxBond {
	return bond.name === 'combobox';
}
export const PopupContext = Kernel.context<PopoverBond>('prototype/popup');
