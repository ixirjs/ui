import type { PopupBond } from './bond.svelte';
import type { ComboboxItemAtom, PopupChange } from './types';

/** One item handle for menus, Select and Combobox. No ItemBond or mirrored selection state. */
export class CollectionItemAtom implements ComboboxItemAtom {
	readonly #parent: PopupBond;
	readonly value: string;
	readonly #release: () => void;
	#disposed = false;

	constructor(parent: PopupBond, value: string, release: () => void) {
		this.#parent = parent;
		this.value = value;
		this.#release = release;
	}
	get id() {
		return this.#parent.itemId(this.value);
	}
	get label() {
		return this.#parent.option(this.value)?.label ?? this.value;
	}
	get isDisabled() {
		const option = this.#parent.option(this.value);
		return this.#disposed || this.#parent.isDisabled || !option || Boolean(option.disabled);
	}
	get isHighlighted() {
		return this.#parent.navigation.activeId === this.value;
	}
	get isSelected() {
		return this.#parent.selection.isSelected(this.value);
	}

	readonly #onclick = (event: MouseEvent) => {
		if (!event.defaultPrevented) this.activate({ event, reason: 'item' });
	};
	get attrs(): Record<string, unknown> {
		const selectable = this.#parent.name === 'select' || this.#parent.name === 'combobox';
		return {
			id: this.id,
			role: selectable ? 'option' : 'menuitem',
			'aria-disabled': this.isDisabled,
			'aria-selected': selectable ? this.isSelected : undefined,
			'data-highlighted': this.isHighlighted,
			'data-value': this.value,
			onclick: this.#onclick
		};
	}
	activate(change: PopupChange = {}) {
		if (!this.isDisabled) this.#parent.activate(this.value, change);
	}
	select(change: PopupChange = {}) {
		if (!this.isDisabled) this.#parent.select(this.value, change);
	}
	unselect(change: PopupChange = {}) {
		if (!this.#disposed) this.#parent.unselect(this.value, change);
	}
	toggle(change: PopupChange = {}) {
		if (!this.isDisabled) this.#parent.toggleSelection(this.value, change);
	}
	dispose() {
		if (this.#disposed) return;
		this.#disposed = true;
		this.#release();
	}
}
