export * as Combobox from './atoms';

// Bond/state/spec — the extension contract: consumers can `defineBond({ extends: ComboboxBond })`
// or `defineBond({ parts: [ComboboxBond] })`.
export * from './bond.svelte';

export * from './types';

export type {
	AnimatePopoverContentParams as AnimateComboboxContentParams,
	animatePopoverContent as animateComboboxContent
} from '$ixirjs/ui/components/popover/motion.svelte';
