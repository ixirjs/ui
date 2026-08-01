import { closeOverlay } from '$svelte-atoms/core/components/portal/host/policies/overlay-view';
import { Atom } from '$svelte-atoms/core/shared/bond';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import { nanoid } from 'nanoid';
import type { SelectBond } from '../bond.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type SelectItemAtomProps<T = unknown> = {
	value: string;
	label?: string;
	data?: T;
	id?: string;
};

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const SELECT_ITEM = sharedCapabilityKey<void>('@svelte-atoms/select:item-node');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

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
		this.#id = props.id ?? nanoid();
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

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function selectItemPresentation<B extends SelectBond>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: SELECT_ITEM,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['item'],
			docs: 'Select rendered item option role projection.'
		},
		behavior: {
			attrs: () => ({
				role: 'option'
			})
		}
	});
}
