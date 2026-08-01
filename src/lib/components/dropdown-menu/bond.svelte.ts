import {
	PopoverBond,
	PopoverBondBase,
	PopoverContentAtom,
	PopoverTriggerAtom,
	type PopoverBondProps,
	type PopoverDomElements,
	type PopoverStateProps
} from '$svelte-atoms/core/components/popover/bond.svelte';
import {
	closeOverlay,
	overlayIsOpen
} from '$svelte-atoms/core/components/portal/host/policies/overlay-view';
import { Atom, defineAtom } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf, type BondSpec } from '$svelte-atoms/core/shared';
import {
	createRovingFocus,
	rovingCapability,
	type RovingFocus
} from '$svelte-atoms/core/shared/capability/models/roving.svelte';
import { navigationCapability } from '$svelte-atoms/core/shared/capability/models/navigation.svelte';
import { typeaheadCapability } from '$svelte-atoms/core/shared/capability/models/typeahead.svelte';
import { clickTrigger } from '$svelte-atoms/core/components/portal/host';
import type { DropdownMenuItemControllerInterface } from './item/controller.svelte';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DropdownMenuBondProps = PopoverBondProps;

export type DropdownMenuBondElements = PopoverDomElements;

// Item union: a per-instance Atom (dropdown-menu or subclass like SelectItemAtom) or a controller facade.
export type DropdownMenuItem =
	// `Atom<any, any>`: items are heterogeneous (HTMLElement-bound atoms like SelectItemAtom),
	// and the element type is irrelevant to menu membership — widening avoids the `#behaviorAttachments`
	// node-type contravariance that rejects `Atom<_, HTMLElement>` against the default union member.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	DropdownMenuItemControllerInterface<Record<string, any>> | Atom<any, any>;

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class DropdownMenuBondBase<
	Props extends DropdownMenuBondProps = DropdownMenuBondProps
> extends PopoverBondBase<Props> {
	// Roving-focus capability over item ids; activeId/activeItem/next/previous own highlighting and navigation.
	#roving: RovingFocus<DropdownMenuItem> = createRovingFocus<DropdownMenuItem>({
		ids: () => this.items.keys,
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
			typeaheadCapability(this.items, this.#roving, {
				roles: ['container', 'trigger'],
				enabled: () => this.isOpen && !this.isDisabled
			})
		);
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

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DropdownMenuBondView = DropdownMenuBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const DROPDOWN_MENU_CONTENT = sharedCapabilityKey<void>('@svelte-atoms/dropdown-menu:content');
const DROPDOWN_MENU_TRIGGER = sharedCapabilityKey<void>('@svelte-atoms/dropdown-menu:trigger');
const DROPDOWN_MENU_ITEM = sharedCapabilityKey<void>('@svelte-atoms/dropdown-menu:item');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class DropdownMenuContentAtom<
	B extends DropdownMenuBondView = DropdownMenuBondView
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
export type DropdownMenuTriggerAtom = InstanceType<typeof DropdownMenuTriggerAtom>;

export const DropdownMenuItemAtom = defineAtom<DropdownMenuBondView>('item', (atom) => {
	atom.capability(dropdownMenuItemPresentation());
});
export type DropdownMenuItemAtom = InstanceType<typeof DropdownMenuItemAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function dropdownMenuContentPresentation<B extends DropdownMenuBondView>(role: () => string) {
	return defineAtomCapability<void, AtomHost, B>({
		slot: DROPDOWN_MENU_CONTENT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['content'],
			docs: 'Dropdown menu content container role projection.'
		},
		behavior: {
			attrs: () => ({
				// aria-activedescendant + orientation come from roving; key navigation from navigation.
				role: role()
			})
		}
	});
}

function dropdownMenuTriggerActivation<B extends DropdownMenuBondView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: DROPDOWN_MENU_TRIGGER,
		meta: {
			layer: 1,
			kind: 'policy',
			projects: ['trigger'],
			docs: 'Dropdown menu trigger activation of the highlighted item.'
		},
		behavior: {
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
	});
}

function dropdownMenuItemPresentation<B extends DropdownMenuBondView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: DROPDOWN_MENU_ITEM,
		meta: {
			layer: 1,
			kind: 'policy',
			projects: ['item'],
			docs: 'Dropdown menu item role and keyboard close policy.'
		},
		behavior: {
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
						closeOverlay(bond);
					}
				}
			})
		}
	});
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const dropdownMenuSpec = {
	parts: [PopoverBond],
	name: 'dropdown-menu',
	base: DropdownMenuBondBase,
	atoms: {
		content: { atom: DropdownMenuContentAtom, role: 'container' },
		trigger: DropdownMenuTriggerAtom,
		item: DropdownMenuItemAtom
	},
	capabilities: () => [clickTrigger({ ariaHasPopup: 'menu' })]
} satisfies BondSpec<
	{
		content: { atom: typeof DropdownMenuContentAtom; role: 'container' };
		trigger: typeof DropdownMenuTriggerAtom;
		item: typeof DropdownMenuItemAtom;
	},
	typeof DropdownMenuBondBase
>;

// DropdownMenuBond — flat composition over PopoverBond.
// Adds roving-focus, overrides content/trigger roles, adds `item` slot.
const DropdownMenuBondImpl = defineBond<
	{
		content: { atom: typeof DropdownMenuContentAtom; role: 'container' };
		trigger: typeof DropdownMenuTriggerAtom;
		item: typeof DropdownMenuItemAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof DropdownMenuBondBase
>(dropdownMenuSpec);

// Instance type — paired with the `const` (value + type).
export type DropdownMenuBond = BondOf<typeof DropdownMenuBondImpl>;

interface DropdownMenuBondConstructor {
	new (props: DropdownMenuBondProps): DropdownMenuBond;
	readonly CONTEXT_KEY: string;
	readonly CONTEXT_KEYS?: readonly string[];
	readonly spec: (typeof DropdownMenuBondImpl)['spec'];
	get(): DropdownMenuBond | undefined;
	getOrThrow(message?: string): DropdownMenuBond;
	set(bond: DropdownMenuBond): DropdownMenuBond;
	create(props: DropdownMenuBondProps): DropdownMenuBond;
}

export const DropdownMenuBond = DropdownMenuBondImpl as unknown as DropdownMenuBondConstructor;

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type { PopoverStateProps };
