import { generateId } from '$ixirjs/ui/authoring';
import type { DropdownMenuItem } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import type { SelectBondBase } from '$ixirjs/ui/components/select/bond.svelte';

export type SelectItemAtomProps<T = unknown> = {
	value: string;
	label?: string;
	data?: T;
	id?: string;
};

/**
 * One rendered option. A plain state class since the Kernel redesign: it carries the option's
 * identity and answers `isHighlighted` / `isSelected` off the Bond's roving and selection models.
 * `element` resolves by the id it rendered, so no capture attachment is minted per option.
 */
export class SelectItemAtom<
	Data = unknown,
	B extends SelectBondBase = SelectBondBase
> implements DropdownMenuItem {
	#id: string;
	#props: SelectItemAtomProps<Data>;
	#selectBond: B;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#createdAt = new Date();

	constructor(props: SelectItemAtomProps<Data>, selectBond: B) {
		this.#props = props;
		this.#selectBond = selectBond;
		this.#id = props.id ?? generateId();
	}

	get id() {
		return this.#id;
	}

	get createdAt() {
		return this.#createdAt;
	}

	get props() {
		return this.#props;
	}

	get value() {
		return this.props.value;
	}

	get data() {
		return this.props.data;
	}

	/** The DOM id this option renders — also what `aria-activedescendant` points at. */
	get domId() {
		return `select-item-${this.#id}`;
	}

	get element(): HTMLElement | null {
		return typeof document === 'undefined' ? null : document.getElementById(this.domId);
	}

	get label() {
		const element = this.element;
		const labelled = (element?.querySelector('[data-label]') ?? element) as
			| HTMLElement
			| undefined
			| null;
		return labelled?.innerText ?? this.#props.label ?? '';
	}

	get isHighlighted() {
		// Options register into the roving by `value`, so the active id IS the value.
		return this.#selectBond.roving.activeId === this.value;
	}

	get isSelected() {
		// Through the model, not `props.values.includes`: this is read once per option per render.
		return this.#selectBond.selection.isSelected(this.value);
	}

	select() {
		this.#selectBond.select([this.value]);
	}

	unselect() {
		this.#selectBond.unselect([this.value]);
	}

	toggle() {
		if (this.isSelected) this.unselect();
		else this.select();
	}

	close() {
		this.#selectBond.close();
	}
}
