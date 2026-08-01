import {
	PopoverBond,
	PopoverState,
	PopoverContentAtom,
	PopoverTriggerAtom,
	type PopoverDomElements,
	type PopoverStateProps
} from '$svelte-atoms/core/components/popover/bond.svelte';
import { BondAtom } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type ViewOf, type BondOf } from '$svelte-atoms/core/shared';
import {
	createRovingFocus,
	rovingCapability,
	type RovingFocus
} from '$svelte-atoms/core/shared/capabilities/roving-focus.svelte';
import { clickTrigger } from '$svelte-atoms/core/shared/overlay';
import type { DropdownMenuItemControllerInterface } from './item/controller.svelte';

export type DropdownMenuBondProps = PopoverStateProps;

export type DropdownMenuBondElements = PopoverDomElements;

// Item union: a per-instance BondAtom (dropdown-menu or subclass like SelectItemAtom) or a controller facade.
export type DropdownMenuItem =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	DropdownMenuItemControllerInterface<Record<string, any>> | BondAtom;

// State first — it references DropdownMenuItemAtom only in type positions (a class
// type is usable module-wide before its value declaration), which lets the atoms below
// type `this.bond` against a view that includes this state (the atom↔bond cycle break).
export class DropdownMenuBondState<
	Props extends DropdownMenuBondProps = DropdownMenuBondProps
> extends PopoverState<Props> {
	// Roving-focus capability over item ids; activeId/activeItem/next/previous own highlighting and navigation.
	#roving: RovingFocus<DropdownMenuItem> = createRovingFocus<DropdownMenuItem>({
		ids: () => this.items.keys,
		item: (id) => this.items.get(id)
	});

	constructor(props: Props) {
		super(props);
		// Project aria-activedescendant + aria-orientation onto the content (role:'container').
		// `itemDomId` is overridable — subclasses (select) map the roving id to their own
		// item DOM id scheme. See docs/extensibility-vision.md §11.3.
		this.capability(
			rovingCapability(this.#roving, {
				itemDomId: (id) => this.itemDomId(id),
				orientation: 'vertical'
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
		return this.items.attach(id, item);
	}

	unmountItem(id: string) {
		this.items.delete(id);
	}

	item(id: string) {
		return this.items.get(id);
	}

	registerItem(id: string, atom: DropdownMenuItem) {
		return this.items.attach(id, atom);
	}

	unregisterItem(id: string) {
		this.items.delete(id);
	}
}

// Bond shape the dropdown-menu atoms type `this.bond` against — breaks the atom↔bond declaration cycle.
type DropdownMenuBondView = ViewOf<DropdownMenuBondState>;

export class DropdownMenuContentAtom extends PopoverContentAtom<DropdownMenuBondView> {
	declare protected bond: DropdownMenuBondView;

	// The container's ARIA role — overridable by flavours (select → 'listbox').
	protected get contentRole(): string {
		return 'menu';
	}

	override get attrs() {
		// `aria-activedescendant` + `aria-orientation` come from the roving capability
		// projection (role:'container'); only the role is component-specific.
		return {
			...super.attrs,
			role: this.contentRole
		};
	}

	override get handlers() {
		const superHandlers = super.handlers as { onkeydown?: (ev: KeyboardEvent) => void };
		return {
			...superHandlers,
			onkeydown: (ev: KeyboardEvent) => {
				superHandlers.onkeydown?.(ev);

				if (ev.defaultPrevented) return;

				if (ev.key === 'ArrowDown') {
					this.bond.state.roving.next();
				}

				if (ev.key === 'ArrowUp') {
					this.bond.state.roving.previous();
				}
			}
		};
	}
}

export class DropdownMenuTriggerAtom extends PopoverTriggerAtom<DropdownMenuBondView> {
	declare protected bond: DropdownMenuBondView;

	override get handlers() {
		const superHandlers = super.handlers as { onkeydown?: (ev: KeyboardEvent) => void };

		return {
			...superHandlers,
			onkeydown: (ev: KeyboardEvent) => {
				if (ev.key === 'ArrowDown') {
					this.bond.state.roving.next();
				}

				if (ev.key === 'ArrowUp') {
					this.bond.state.roving.previous();
				}

				if (
					(ev.key === 'Enter' || ev.key === ' ') &&
					this.bond.state.props.open &&
					this.bond.state.roving.activeItem
				) {
					if (ev.key === ' ') {
						ev.preventDefault();
					}

					(this.bond.state.roving.activeItem?.element as HTMLElement | undefined)?.click?.();
				}

				superHandlers.onkeydown?.(ev);
			}
		};
	}
}

export class DropdownMenuItemAtom<
	B extends DropdownMenuBondView = DropdownMenuBondView
> extends BondAtom<B> {
	constructor(bond: B) {
		super(bond, 'item');
	}
	override get attrs() {
		return {
			...super.attrs,
			role: 'menuitem' as const
		};
	}

	override get handlers() {
		return {
			onkeyup: (ev: KeyboardEvent) => {
				const currentTarget = ev.currentTarget as HTMLElement;
				const disabled =
					currentTarget.getAttribute('disabled') ||
					currentTarget.getAttribute('aria-disabled') === 'true';

				if (disabled) return;

				if (ev.key === 'Enter' || ev.key === ' ') {
					ev.preventDefault();
					this.bond?.state.close();
				}
			}
		};
	}
}

// DropdownMenuBond — flat composition over PopoverBond (ADR 0004 D1).
// Adds roving-focus, overrides content/trigger roles, adds `item` slot.
export const DropdownMenuBond = defineBond<
	{
		content: { atom: typeof DropdownMenuContentAtom; role: 'container' };
		trigger: typeof DropdownMenuTriggerAtom;
		item: typeof DropdownMenuItemAtom;
	},
	DropdownMenuBondState
>({
	parts: [PopoverBond],
	name: 'dropdown-menu',
	atoms: {
		content: { atom: DropdownMenuContentAtom, role: 'container' },
		trigger: DropdownMenuTriggerAtom,
		item: DropdownMenuItemAtom
	},
	capabilities: () => [clickTrigger({ ariaHasPopup: 'menu' })]
});

// Instance type — paired with the `const` (value + type).
export type DropdownMenuBond = BondOf<typeof DropdownMenuBond>;
