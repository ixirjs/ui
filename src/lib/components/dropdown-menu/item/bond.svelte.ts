import { generateId } from '$ixirjs/ui/authoring';
import type {
	DropdownMenuBondBase,
	DropdownMenuItem
} from '$ixirjs/ui/components/dropdown-menu/bond.svelte';

export type DropdownMenuItemAtomProps = {
	id: string;
	// `| undefined`: callers pass an unset `disabled` prop; the item treats undefined as not-disabled.
	disabled?: boolean | undefined;
};

/**
 * One rendered menu item. A plain state class since the Kernel redesign — it carries the item's
 * identity, answers `isHighlighted` off the menu's roving focus, and resolves its own element by
 * the id it rendered rather than capturing the node.
 */
export class DropdownMenuItemAtom<
	B extends DropdownMenuBondBase = DropdownMenuBondBase
> implements DropdownMenuItem {
	#id: string;
	#props: DropdownMenuItemAtomProps;
	#menuBond: B;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#createdAt = new Date();

	constructor(props: DropdownMenuItemAtomProps, menuBond: B) {
		this.#props = props;
		this.#menuBond = menuBond;
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

	get bond(): B {
		return this.#menuBond;
	}

	get preset() {
		return `${this.#menuBond.name}.item`;
	}

	/** The DOM id this item renders — also what `aria-activedescendant` points at. */
	get domId() {
		return `menu-item-${this.#id}`;
	}

	get element(): HTMLElement | null {
		return typeof document === 'undefined' ? null : document.getElementById(this.domId);
	}

	get isHighlighted() {
		return this.#menuBond.roving.activeId === this.id;
	}

	close(event?: Event) {
		this.#menuBond.stageOpenChange({
			...(event ? { event } : {}),
			reason: 'item-select'
		});
		this.#menuBond.close();
	}
}
