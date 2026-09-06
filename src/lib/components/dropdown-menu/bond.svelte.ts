import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	PopoverContext,
	type PopoverBondProps,
	type PopoverBondBase
} from '$ixirjs/ui/components/popover/bond.svelte';
import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
import { useOutsidePress, usePositioned } from '$ixirjs/ui/components/overlay/behavior.svelte';
import type { TypeaheadSource } from '$ixirjs/ui/capability';
import type { DropdownMenuPresets } from './types';
import type { DropdownMenuBond } from '$ixirjs/ui/components/overlay/popup/types';
export type { DropdownMenuBond } from '$ixirjs/ui/components/overlay/popup/types';
export type DropdownMenuBondBase<Props extends DropdownMenuBondProps = DropdownMenuBondProps> =
	Omit<DropdownMenuBond, 'props'> & { readonly props: Props };

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
	PopoverContext.share(bond);
	OverlayContext.share(bond);
	DropdownMenuContext.share(bond);
	usePositioned(bond);
	useOutsidePress(bond, {
		event: 'click',
		onDismiss: (event, o) => (o as PopoverBondBase).onclickoutside?.(event, o as PopoverBondBase)
	});
}
