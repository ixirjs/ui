import { closeOverlay } from '$ixirjs/ui/components/overlay/policies/overlay-view';
import { Atom, generateId } from '$ixirjs/ui/shared/bond';
import { partCapability } from '$ixirjs/ui/shared/capability';
import { lazyCapability } from '$ixirjs/ui/shared/capability/intern';
import type { SelectBond } from '$ixirjs/ui/components/select/bond.svelte';

export type SelectItemAtomProps<T = unknown> = {
	value: string;
	label?: string;
	data?: T;
	id?: string;
};

export class SelectItemAtom<Data = unknown, B extends SelectBond = SelectBond> extends Atom<
	B,
	HTMLElement
> {
	#id: string;
	#props: SelectItemAtomProps<Data>;
	#selectBond: B;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#createdAt = new Date();

	constructor(props: SelectItemAtomProps<Data>, selectBond: B) {
		super(selectBond, `item-${props.value}`);
		this.#props = props;
		this.#selectBond = selectBond;
		this.#id = props.id ?? generateId();
		// Fold in the selection capability's `item` projection (aria-selected +
		// data-selected from the shared model). Attrs-only — the .svelte keeps its
		// own click (select + close).
		this.role('item', props.value);
		this.capability(selectItemPresentation());
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

	get label() {
		const element = (this.element?.querySelector('[data-label]') ?? this.element) as
			| HTMLElement
			| undefined
			| null;
		return element?.innerText ?? this.#props.label ?? '';
	}

	get isHighlighted() {
		// Select items register into the roving by `value`, so the active id IS the value.
		return this.#selectBond.roving.activeId === this.value;
	}

	get isSelected() {
		return this.#selectBond.props.values?.includes(this.value) ?? false;
	}

	override get attrs() {
		const itemId = `select-item-${this.id}`;
		// `aria-selected` + `data-selected` (selection capability) and `data-highlighted`
		// (roving capability) all come from the `item` projections folded in by
		// `.role('item', value)` in the constructor — none are hand-rolled here.
		return {
			...super.attrs,
			id: itemId
		};
	}

	select() {
		this.#selectBond?.select([this.value]);
	}

	unselect() {
		this.#selectBond?.unselect([this.value]);
	}

	toggle() {
		if (this.isSelected) {
			this.unselect();
		} else {
			this.select();
		}
	}

	close() {
		closeOverlay(this.#selectBond);
	}
}

// Built once, not per rendered option: the descriptor is surface-less and reads nothing from the
// instance, so one frozen value serves every item in every select.
const selectItemPresentation = lazyCapability(() =>
	partCapability<SelectBond>(
		'@ixirjs/select:item-node',
		'item',
		'Select rendered item option role projection.',
		{
			attrs: () => ({
				role: 'option'
			})
		}
	)
);
