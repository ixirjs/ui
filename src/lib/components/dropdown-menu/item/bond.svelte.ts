import { closeOverlay } from '$svelte-atoms/core/components/portal/host/policies/overlay-view';
import { Atom } from '$svelte-atoms/core/shared/bond';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import { nanoid } from 'nanoid';
import type { DropdownMenuBond } from '../bond.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DropdownMenuItemAtomProps = {
	id: string;
	// `| undefined`: callers pass an unset `disabled` prop; the atom treats undefined as not-disabled.
	disabled?: boolean | undefined;
};

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const DROPDOWN_MENU_ITEM = sharedCapabilityKey<void>('@svelte-atoms/dropdown-menu:item-node');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class DropdownMenuItemAtom<B extends DropdownMenuBond = DropdownMenuBond> extends Atom<
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
		// Fold in the roving capability's `item` projection (`data-highlighted`); attrs-only,
		// the .svelte keeps its own click.
		this.role('item', this.#id);
		this.capability(dropdownMenuItemPresentation(() => this.#props.disabled));
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

	override get preset() {
		return `${this.#menuBond.preset}.item`;
	}

	get isHighlighted() {
		return this.#menuBond.roving.activeId === this.id;
	}

	override get attrs() {
		const itemId = `menu-item-${this.id}`;
		// `data-highlighted` comes from the roving capability's `item` projection
		// (folded via `.role('item', id)` in the constructor) — not hand-rolled here.
		return {
			...super.attrs,
			id: itemId
		};
	}

	close() {
		closeOverlay(this.#menuBond);
	}
}

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function dropdownMenuItemPresentation<B extends DropdownMenuBond>(
	disabled: () => boolean | undefined
) {
	return defineAtomCapability<void, AtomHost, B>({
		slot: DROPDOWN_MENU_ITEM,
		meta: {
			layer: 1,
			kind: 'policy',
			projects: ['item'],
			docs: 'Dropdown menu rendered item role, disabled projection, and close policy.'
		},
		behavior: {
			attrs: () => ({
				role: 'menuitem',
				'aria-disabled': disabled() ? true : undefined,
				tabIndex: disabled() ? -1 : 0
			}),
			handlers: (_node, bond) => ({
				onclick: () => {
					if (bond) closeOverlay(bond);
				}
			})
		}
	});
}
