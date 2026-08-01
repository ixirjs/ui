import { fuse, type BondOf } from '$ixirjs/ui/shared';
import { PopoverBond, PopoverTriggerAtom } from '$ixirjs/ui/components/popover/bond.svelte';
import {
	DialogBond,
	DialogBondBase,
	type DialogBond as DialogBondInstance,
	type DialogBondProps
} from '$ixirjs/ui/components/dialog/bond.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type PopoverDialogBondProps = DialogBondProps;

// Fusion of Popover + Dialog: popover's trigger opens a modal dialog instead of a floating panel.
// Dialog atoms/capabilities win per-slot (last-wins); floating atoms are inert at runtime.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const PopoverDialogBond = fuse({
	name: 'popover-dialog',
	base: DialogBondBase,
	parts: [PopoverBond, DialogBond],
	atoms: { trigger: PopoverTriggerAtom }
});

// Narrows fuse()'s default props slot so PropsOf resolves correctly.
export type PopoverDialogBond = BondOf<typeof PopoverDialogBond> &
	DialogBondInstance & {
		readonly __props?: PopoverDialogBondProps;
		readonly props: PopoverDialogBondProps;
	};

// Constructor facade (TabsBond pattern): re-types new/get/set to prop-narrowed instance.
