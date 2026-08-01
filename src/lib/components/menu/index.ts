// @deprecated Import from `dropdown-menu` instead. This module will be removed in a future version.

// Namespace — DropdownMenu is the canonical export; Menu remains for backward compat
export {
	// @deprecated Use `DropdownMenu` instead.
	DropdownMenu as Menu
} from '../dropdown-menu';

// Bond classes
export {
	// @deprecated Use `DropdownMenuBond` instead.
	DropdownMenuBond as MenuBond,
	// @deprecated Use `DropdownMenuBondState` instead.
	DropdownMenuBondState as MenuBondState,
	// @deprecated Use `DropdownMenuBondProps` instead.
	type DropdownMenuBondProps as MenuBondProps,
	// @deprecated Use `DropdownMenuBondElements` instead.
	type DropdownMenuBondElements as MenuBondElements
} from '../dropdown-menu/bond.svelte';

// Attachment function
export {
	// @deprecated Use `dropdownMenu` instead.
	dropdownMenu as menu
} from '../dropdown-menu/attachments.svelte';

// Animate aliases
export type {
	// @deprecated Use `AnimateDropdownMenuContentParams` instead.
	AnimateDropdownMenuContentParams as AnimateMenuContentParams
} from '../dropdown-menu';

// List types
export type {
	// @deprecated Use `DropdownMenuListProps` instead.
	DropdownMenuListProps as MenuListProps
} from '../dropdown-menu/types';

// Item exports (already shimmed in item/index.ts)
export * from './item';
