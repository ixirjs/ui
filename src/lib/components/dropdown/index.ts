// @deprecated Import from `select` instead. Namespace — Select is canonical; Dropdown for compat.
export {
	/** @deprecated Use `Select` instead. */
	Select as Dropdown
} from '../select';

// Bond classes
export {
	/** @deprecated Use `SelectBond` instead. */
	SelectBond as DropdownBond,
	/** @deprecated Use `SelectBondState` instead. */
	SelectBondState as DropdownBondState,
	/** @deprecated Use `SelectBondElements` instead. */
	type SelectBondElements as DropdownBondElements,
	/** @deprecated Use `SelectStateProps` instead. */
	type SelectStateProps as DropdownStateProps
} from '../select/bond.svelte';

// Item exports (already shimmed in item/index.ts)
export * from './item';

// Runes
export {
	/** @deprecated Use `filterSelectData` instead. */
	filterSelectData as filterDropdownData
} from '../select/runes.svelte';
// @deprecated Use `filterSelectData` instead.
export { filterSelectData as filter } from '../select/runes.svelte';

// Types
export type {
	DropdownRootProps,
	DropdownTriggerProps,
	DropdownSelectionsProps,
	DropdownSelectionProps,
	DropdownQueryProps,
	DropdownSelection
} from './types';

// Animate aliases
export type {
	/** @deprecated Use `AnimateSelectContentParams` instead. */
	AnimateSelectContentParams as AnimateDropdownContentParams
} from '../select';

// Attachment functions
export {
	/** @deprecated Use `select` instead. */
	select as dropdown
} from '../select/attachments.svelte';
