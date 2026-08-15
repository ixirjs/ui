import {
	PopoverBond,
	PopoverBondBase,
	PopoverContentAtom,
	PopoverTriggerAtom,
	type PopoverBondProps,
	type PopoverStateProps
} from '$ixirjs/ui/components/popover/bond.svelte';
import { overlayIsOpen } from '$ixirjs/ui/components/overlay/policies/overlay-view';
import { Atom, defineAtom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	createRovingFocus,
	rovingCapability,
	type RovingFocus
} from '$ixirjs/ui/shared/capability/models/roving.svelte';
import { navigationCapability } from '$ixirjs/ui/shared/capability/models/navigation.svelte';
import {
	typeaheadCapability,
	type TypeaheadSource
} from '$ixirjs/ui/shared/capability/models/typeahead.svelte';
import { clickTrigger } from '$ixirjs/ui/components/overlay';
import type { DropdownMenuItemControllerInterface } from './item/controller.svelte';
import { partCapability } from '$ixirjs/ui/shared/capability';
import { lazyCapability } from '$ixirjs/ui/shared/capability/intern';

export type DropdownMenuBondProps = PopoverBondProps;

// Item union: a per-instance Atom (dropdown-menu or subclass like SelectItemAtom) or a controller facade.
export type DropdownMenuItem =
	// `Atom<any, any>`: items are heterogeneous (HTMLElement-bound atoms like SelectItemAtom),
	// and the element type is irrelevant to menu membership — widening avoids the `#behaviorAttachments`
	// node-type contravariance that rejects `Atom<_, HTMLElement>` against the default union member.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	DropdownMenuItemControllerInterface<Record<string, any>> | Atom<any, any>;

/** Ordered item ids plus the searchable entries behind them. `Collection<DropdownMenuItem>` satisfies it, and is the default. */
export interface MenuItemSource<T = DropdownMenuItem | undefined> extends TypeaheadSource<T> {
	readonly keys: readonly string[];
}

/**
 * Delegates on every read: typeahead captures its source once at construction, while
 * `navigableItems` is overridable and can change with props.
 */
function delegatingNavigableItems(bond: DropdownMenuBondBase): MenuItemSource {
	return {
		get entries() {
			return bond.navigableItems.entries;
		},
		get keys() {
			return bond.navigableItems.keys;
		},
		indexOf: (id) => bond.navigableItems.indexOf(id)
	};
}

export class DropdownMenuBondBase<
	Props extends DropdownMenuBondProps = DropdownMenuBondProps
> extends PopoverBondBase<Props> {
	// Roving-focus capability over item ids; activeId/activeItem/next/previous own highlighting and navigation.
	// `ids` comes from `navigableItems`, which a virtualized subclass points at its data; `item` stays
	// the Collection, because `activeItem` means the mounted Atom and callers click it.
	#roving: RovingFocus<DropdownMenuItem> = createRovingFocus<DropdownMenuItem>({
		ids: () => this.navigableItems.keys,
		item: (id) => this.items.get(id)
	});

	constructor(props: Props, name = 'dropdown-menu') {
		super(props, name);
		// Eagerly create owned collections outside derived reads; collection() registers a capability.
		void this.items;
		// Project aria-activedescendant + aria-orientation onto the content (role:'container').
		// `itemDomId` is overridable — subclasses (select) map the roving id to their own
		// item DOM id scheme.
		this.capability(
			rovingCapability(this.#roving, {
				itemDomId: (id) => this.itemDomId(id),
				orientation: 'vertical'
			})
		);
		// Arrow-key navigation projected onto content + trigger (replaces hand-rolled per-atom keydown).
		this.capability(navigationCapability(this.#roving, { roles: ['container', 'trigger'] }));
		this.capability(
			typeaheadCapability(delegatingNavigableItems(this), this.#roving, {
				roles: ['container', 'trigger'],
				collectionKind: this.items.kind,
				enabled: () => this.isOpen && !this.isDisabled,
				text: (item, id) => this.itemText(item, id)
			})
		);
	}

	/**
	 * Where the ordered item ids and searchable entries come from. The Collection by default, where
	 * every mounted item is every item. A virtualized subclass overrides it with a data-backed source,
	 * since the Collection then holds only the window and roving would stop at its edge.
	 */
	get navigableItems(): MenuItemSource {
		return this.items;
	}

	/**
	 * Searchable text for one entry. Defers to typeahead's own resolution, which reads the mounted
	 * element — unavailable to a virtualized menu, which overrides this to read its data.
	 */
	protected itemText(_item: DropdownMenuItem | undefined, _id: string): string | undefined | null {
		return undefined;
	}

	// Maps a roving id to its DOM element id for aria-activedescendant.
	// Default: `menu-item-${id}`. Overridden by select (uses `select-item-${id}`).
	protected itemDomId(id: string): string {
		return `menu-item-${id}`;
	}

	// Kind-cached Collection of registered items; subclasses share this instance.
	get items() {
		return this.collection<DropdownMenuItem>('item');
	}

	// The roving-focus capability — highlighted item and keyboard navigation.
	get roving(): RovingFocus<DropdownMenuItem> {
		return this.#roving;
	}

	mountItem(id: string, item: DropdownMenuItem) {
		return this.items.set(id, item);
	}

	unmountItem(id: string) {
		this.items.delete(id);
	}

	item(id: string) {
		return this.items.get(id);
	}

	registerItem(id: string, atom: DropdownMenuItem) {
		return this.items.set(id, atom);
	}

	unregisterItem(id: string) {
		this.items.delete(id);
	}
}

// Bond shape the dropdown-menu atoms type `this.bond` against.

export class DropdownMenuContentAtom<
	B extends DropdownMenuBondBase = DropdownMenuBondBase
> extends PopoverContentAtom<B> {
	declare protected bond: B;

	constructor(bond: B) {
		super(bond);
		this.capability(dropdownMenuContentPresentation(() => this.contentRole));
	}

	// The container's ARIA role — overridable by flavours (select → 'listbox').
	protected get contentRole(): string {
		return 'menu';
	}
}

export const DropdownMenuTriggerAtom = defineAtom(PopoverTriggerAtom, (atom) => {
	atom.capability(dropdownMenuTriggerActivation());
});

export const DropdownMenuItemAtom = defineAtom<DropdownMenuBondBase>('item', {
	slot: '@ixirjs/dropdown-menu:item',
	docs: 'Dropdown menu item role and keyboard close policy.',
	attrs: () => ({
		role: 'menuitem' as const
	}),
	handlers: (_node, bond) => ({
		onkeyup: (ev: KeyboardEvent) => {
			if (!bond) return;
			const currentTarget = ev.currentTarget as HTMLElement;
			const disabled =
				currentTarget.getAttribute('disabled') ||
				currentTarget.getAttribute('aria-disabled') === 'true';

			if (disabled) return;

			if (ev.key === 'Enter' || ev.key === ' ') {
				ev.preventDefault();
				bond.stageOpenChange({ event: ev, reason: 'item-select' });
				bond.close();
			}
		}
	})
});

// Per-instance by necessity: `contentRole` is a protected getter a flavour overrides (Select →
// 'listbox'), so the descriptor closes over the atom. That is one content atom per open menu, not
// one per item, which is why this one is not shared the way the item/trigger descriptors are.
function dropdownMenuContentPresentation<B extends DropdownMenuBondBase>(role: () => string) {
	return partCapability<B>(
		'@ixirjs/dropdown-menu:content',
		'content',
		'Dropdown menu content container role projection.',
		{
			attrs: () => ({
				// aria-activedescendant + orientation come from roving; key navigation from navigation.
				role: role()
			})
		}
	);
}

// Built once, not per rendered trigger: surface-less and reads everything through `(node, bond)`.
const dropdownMenuTriggerActivation = lazyCapability(() =>
	partCapability<DropdownMenuBondBase>(
		'@ixirjs/dropdown-menu:trigger',
		'trigger',
		'Dropdown menu trigger activation of the highlighted item.',
		{
			handlers: (_node, bond) => ({
				onkeydown: (ev: KeyboardEvent) => {
					if (!bond) return;
					// Arrow navigation comes from navigation(role:'trigger'); this activates highlighted item.
					if (
						(ev.key === 'Enter' || ev.key === ' ') &&
						overlayIsOpen(bond) &&
						bond.roving.activeItem
					) {
						if (ev.key === ' ') {
							ev.preventDefault();
						}

						(bond.roving.activeItem?.element as HTMLElement | undefined)?.click?.();
					}
				}
			})
		}
	)
);

// DropdownMenuBond — flat composition over PopoverBond.
// Adds roving-focus, overrides content/trigger roles, adds `item` slot.
// Inlined deliberately: `defineBond<const S>` infers `parts` as a tuple only from a literal
// argument. A hoisted spec widens it to an array, which makes `AtomsOf` resolve every inherited
// slot to `never` and blocks `Kernel.part` on slots the runtime spec merge does provide.
export const DropdownMenuBond = defineBond({
	parts: [PopoverBond],
	name: 'dropdown-menu',
	base: DropdownMenuBondBase,
	atoms: {
		content: { atom: DropdownMenuContentAtom, role: 'container' },
		trigger: DropdownMenuTriggerAtom,
		item: DropdownMenuItemAtom
	},
	capabilities: () => [clickTrigger({ ariaHasPopup: 'menu' })]
});

// Instance type — paired with the `const` (value + type).
export type DropdownMenuBond = BondOf<typeof DropdownMenuBond>;

export type { PopoverStateProps };
