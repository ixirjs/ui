import { Atom } from '$ixirjs/ui/shared/bond';
import { partCapability } from '$ixirjs/ui/shared/capability';
import { lazyCapability } from '$ixirjs/ui/shared/capability/intern';
import { generateId } from '$ixirjs/ui/shared/bond';
import type { DropdownMenuBond } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';

export type DropdownMenuItemAtomProps = {
	id: string;
	// `| undefined`: callers pass an unset `disabled` prop; the atom treats undefined as not-disabled.
	disabled?: boolean | undefined;
};

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
		this.#id = props.id ?? generateId();
		// Fold in the roving capability's `item` projection (`data-highlighted`); attrs-only,
		// the .svelte keeps its own click.
		this.role('item', this.#id);
		this.capability(dropdownMenuItemPresentation());
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

	close(event?: Event) {
		this.#menuBond.stageOpenChange({
			...(event ? { event } : {}),
			reason: 'item-select'
		});
		this.#menuBond.close();
	}
}

// Built once, not per rendered item. `disabled` is per-instance, so it is read off the node the
// behavior is handed rather than closed over — which is what makes one frozen descriptor serve
// every item in every menu. Typed by the one member it reads instead of `AtomHost`, which is why
// this uses `defineAtomCapability` rather than the `partCapability` shorthand.
const dropdownMenuItemPresentation = lazyCapability(() =>
	partCapability<DropdownMenuBond, HTMLElement>(
		'@ixirjs/dropdown-menu:item-node',
		'item',
		'Dropdown menu rendered item role, disabled projection, and close policy.',
		{
			// `Atom.capability` types its argument's node as `Atom`, so a behavior cannot declare the
			// subclass it is registered on; the narrowing is asserted here instead. Only this atom
			// registers this slot.
			attrs: (node) => {
				const disabled = (node as DropdownMenuItemAtom).props.disabled;
				return {
					role: 'menuitem',
					'aria-disabled': disabled ? true : undefined,
					tabIndex: disabled ? -1 : 0
				};
			},
			handlers: (_node, bond) => ({
				onclick: (event: MouseEvent) => {
					if (!bond) return;
					bond.stageOpenChange({ event, reason: 'item-select' });
					bond.close();
				}
			})
		}
	)
);
