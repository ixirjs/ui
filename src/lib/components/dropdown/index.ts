// @deprecated Import from `select` instead. Namespace — Select is canonical; Dropdown for compat.
export {
	/** @deprecated Use `Select` instead. */
	Select as Dropdown
} from '../select';

// Bond classes
export {
	/** @deprecated Use `SelectBond` instead. */
	SelectBond as DropdownBond,
	/** @deprecated Use `SelectBondElements` instead. */
	type SelectBondElements as DropdownBondElements,
	/** @deprecated Use `SelectStateProps` instead. */
	type SelectStateProps as DropdownStateProps
} from '../select/bond.svelte';

// Item exports
export * from './item';

// Runes
export {
	/** @deprecated Use `filterSelectData` instead. */
	filterSelectData as filterDropdownData
} from '../select/runes.svelte';
export {
	/** @deprecated Use `filterSelectData` instead. */
	filterSelectData as filter
} from '../select/runes.svelte';

// Types
export type {
	SelectRootProps as DropdownRootProps,
	SelectTriggerProps as DropdownTriggerProps,
	SelectSelectionsProps as DropdownSelectionsProps,
	SelectSelectionProps as DropdownSelectionProps,
	SelectQueryProps as DropdownQueryProps,
	SelectSelection as DropdownSelection
} from '../select/types';

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
