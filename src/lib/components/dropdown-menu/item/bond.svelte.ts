import { BondAtom } from '$svelte-atoms/core/shared/bond.svelte';
import { nanoid } from 'nanoid';
import type { DropdownMenuBond } from '../bond.svelte';

export type DropdownMenuItemAtomProps = {
	id: string;
	disabled?: boolean;
};

export class DropdownMenuItemAtom<B extends DropdownMenuBond = DropdownMenuBond> extends BondAtom<
	B,
	HTMLElement
> {
	#id: string;
	#props: DropdownMenuItemAtomProps;
	#menuBond: B;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#createdAt = new Date();

	constructor(props: DropdownMenuItemAtomProps, menuBond: B) {
		super(menuBond, `item-${props.id}`);
		this.#props = props;
		this.#menuBond = menuBond;
		this.#id = props.id ?? nanoid();
		// Fold in the roving capability's `item` projection (`data-highlighted` from
		// the shared RovingFocus). Attrs-only — the .svelte keeps its own click
		// (close). Mirrors SelectItemAtom. See docs/extensibility-vision.md §11.3.
		this.role('item', this.#id);
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

	get isHighlighted() {
		return this.#menuBond.state.roving.activeId === this.id;
	}

	override get attrs() {
		const itemId = `menu-item-${this.id}`;
		// `data-highlighted` comes from the roving capability's `item` projection
		// (folded via `.role('item', id)` in the constructor) — not hand-rolled here.
		return {
			...super.attrs,
			id: itemId,
			role: 'menuitem',
			'aria-disabled': this.#props.disabled ? true : undefined,
			tabIndex: this.#props.disabled ? -1 : 0
		};
	}

	override get handlers() {
		return {
			onclick: () => {
				this.#menuBond?.state.close();
			}
		};
	}

	close() {
		this.#menuBond?.state.close();
	}
}
