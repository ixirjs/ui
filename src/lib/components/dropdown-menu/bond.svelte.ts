/**
 * DropdownMenu's shared object on the redesigned `Kernel` — a plain state class over Popover.
 *
 * `DropdownMenuBondBase` is what the rest of the menu hierarchy extends (`ContextMenuBondBase`,
 * `SelectBondBase`, `ComboboxBondBase`); `DropdownMenuBond` is the family's own. The behaviour
 * models the capabilities used to wrap — `createRovingFocus` and `createTypeahead` — are reused
 * here as plain functions, and their projections are written literally by each part's `attrs`.
 */
import { SvelteMap } from 'svelte/reactivity';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	PopoverBondBase,
	PopoverContext,
	type PopoverBond,
	type PopoverBondProps
} from '$ixirjs/ui/components/popover/bond.svelte';
import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
import { useOutsidePress, usePositioned } from '$ixirjs/ui/components/overlay/behavior.svelte';
import { createRovingFocus, type RovingFocus } from '$ixirjs/ui/capability/models/roving.svelte';
import {
	createTypeahead,
	type TypeaheadSource,
	type TypeaheadSurface
} from '$ixirjs/ui/capability/models/typeahead.svelte';
import type { OverlayKnobs, OverlayLike } from '$ixirjs/ui/components/overlay/model.svelte';
import type { DropdownMenuPresets } from './types';

export type DropdownMenuBondProps = PopoverBondProps & {
	presets?: DropdownMenuPresets | undefined;
};

/**
 * What the menu holds per registered item. The rendered item classes (`DropdownMenuItemAtom`,
 * `SelectItemAtom`) satisfy it; `element` resolves by rendered id, so no capture attachment is
 * minted per item.
 */
export interface DropdownMenuItem {
	readonly id: string;
	readonly element: HTMLElement | null;
	readonly props: { readonly disabled?: boolean | undefined; readonly label?: string | undefined };
}

/** Ordered item ids plus the searchable entries behind them. The registration `Map` is the default. */
export interface MenuItemSource<T = DropdownMenuItem | undefined> extends TypeaheadSource<T> {
	readonly keys: readonly string[];
}

/**
 * Outside the class because `keys`/`entries` must stay getters — typeahead and the roving backing
 * hold this object and read through it — and inside an object literal `this` is the literal.
 */
export function menuSource(
	keys: () => readonly string[],
	entries: () => readonly (readonly [string, DropdownMenuItem | undefined])[],
	indexOf: (id: string) => number
): MenuItemSource {
	return {
		get keys() {
			return keys();
		},
		get entries() {
			return entries();
		},
		indexOf
	};
}

export const DropdownMenuContext = Kernel.context<DropdownMenuBondBase>('bond/dropdown-menu');

export class DropdownMenuBondBase<
	Props extends DropdownMenuBondProps = DropdownMenuBondProps
> extends PopoverBondBase<Props> {
	/** Mount-ordered registration map; a child registers at its init and releases on teardown. */
	readonly items = new SvelteMap<string, DropdownMenuItem>();

	#keys = $derived([...this.items.keys()]);
	#entries = $derived([...this.items.entries()]);
	#indexes = $derived.by(() => {
		const index = new Map<string, number>();
		const keys = this.#keys;
		for (let i = 0; i < keys.length; i++) index.set(keys[i]!, i);
		return index;
	});

	// Getters, not a snapshot: roving and typeahead hold this object and read through it.
	#collection: MenuItemSource = menuSource(
		() => this.#keys,
		() => this.#entries,
		(id) => this.#indexes.get(id) ?? -1
	);

	/** Highlighted item and keyboard navigation over `navigableItems`. */
	readonly roving: RovingFocus<DropdownMenuItem> = createRovingFocus<DropdownMenuItem>({
		ids: () => this.navigableItems.keys,
		item: (id) => this.items.get(id)
	});

	/** Buffered printable-key search. Delegates on every read: `navigableItems` is overridable. */
	readonly typeahead: TypeaheadSurface = createTypeahead<DropdownMenuItem | undefined>(
		menuSource(
			() => this.navigableItems.keys,
			() => this.navigableItems.entries,
			(id) => this.navigableItems.indexOf(id)
		),
		this.roving,
		{
			enabled: () => this.isOpen && !this.isDisabled,
			text: (item, id) => this.itemText(item, id)
		}
	);

	constructor(props: Props, name = 'dropdown-menu') {
		super(props, name);
	}

	/** The trigger's `aria-haspopup`. Select and Combobox answer `'listbox'`. */
	get ariaHasPopup(): OverlayKnobs['ariaHasPopup'] {
		return 'menu';
	}

	/** Whether the trigger's own click / Enter / Space gesture toggles the overlay. */
	get triggerToggles(): boolean {
		return true;
	}

	/** The content container's ARIA role. Select and Combobox answer `'listbox'`. */
	get contentRole(): string {
		return 'menu';
	}

	/**
	 * The container ARIA the roving capability projected onto the content. Select adds
	 * `aria-multiselectable`.
	 */
	get contentAttrs(): Record<string, unknown> {
		const active = this.roving.activeId;
		return {
			role: this.contentRole,
			'aria-orientation': 'vertical',
			'aria-activedescendant': active === null ? undefined : this.itemDomId(active)
		};
	}

	/**
	 * Where the ordered item ids and searchable entries come from. The registration map by default,
	 * where every mounted item is every item. A virtualized subclass overrides it with a data-backed
	 * source, since the map then holds only the window and roving would stop at its edge.
	 */
	get navigableItems(): MenuItemSource {
		return this.#collection;
	}

	/**
	 * Searchable text for one entry. `undefined` defers to typeahead's own resolution, which reads
	 * the mounted element — unavailable to a virtualized menu, which overrides this to read its data.
	 */
	itemText(_item: DropdownMenuItem | undefined, _id: string): string | undefined | null {
		return undefined;
	}

	/** A roving id mapped to the DOM id of its rendered element, for `aria-activedescendant`. */
	itemDomId(id: string): string {
		return `menu-item-${id}`;
	}

	/** Registers an item; the returned thunk releases it. */
	registerItem(id: string, item: DropdownMenuItem): () => void {
		this.items.set(id, item);
		return () => {
			if (this.items.get(id) === item) this.items.delete(id);
		};
	}

	unregisterItem(id: string): void {
		this.items.delete(id);
	}

	mountItem(id: string, item: DropdownMenuItem): () => void {
		return this.registerItem(id, item);
	}

	unmountItem(id: string): void {
		this.unregisterItem(id);
	}

	item(id: string): DropdownMenuItem | undefined {
		return this.items.get(id);
	}
}

export class DropdownMenuBond extends DropdownMenuBondBase {
	// The second overload keeps the static side compatible with `OverlayBond.create(outer?)`.
	static override create(props: DropdownMenuBondProps): DropdownMenuBond;
	static override create(outer?: OverlayLike): DropdownMenuBond;
	static override create(props?: DropdownMenuBondProps | OverlayLike): DropdownMenuBond {
		return new DropdownMenuBond(props as DropdownMenuBondProps);
	}
}

// ─── Behaviour written into the parts ───────────────────────────────────────────────────────────

/**
 * Arrow / Home / End navigation plus printable-key typeahead — what `navigationCapability` and
 * `typeaheadCapability` projected onto the `container` and `trigger` roles.
 */
export function menuKeydown(bond: DropdownMenuBondBase) {
	return (event: KeyboardEvent): void => {
		if (!event.defaultPrevented) {
			if (event.key === 'ArrowDown') bond.roving.next();
			else if (event.key === 'ArrowUp') bond.roving.previous();
			else if (event.key === 'Home') {
				bond.roving.first();
				event.preventDefault();
			} else if (event.key === 'End') {
				bond.roving.last();
				event.preventDefault();
			}
		}
		bond.typeahead.handleKeydown(event);
	};
}

/**
 * Everything every menu root does besides its own props: publish the Bond under the popover,
 * overlay-host and menu context keys, and wire the positioned-overlay behaviour. Init-time.
 */
export function useMenuRoot(bond: DropdownMenuBondBase): void {
	PopoverContext.share(bond as unknown as PopoverBond);
	OverlayContext.share(bond);
	DropdownMenuContext.share(bond);
	usePositioned(bond);
	useOutsidePress(bond, {
		event: 'click',
		onDismiss: (event, o) => (o as PopoverBondBase).onclickoutside?.(event, o as PopoverBondBase)
	});
}
