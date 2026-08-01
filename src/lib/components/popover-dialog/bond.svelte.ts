import { fuse, type BondOf } from '$svelte-atoms/core/shared';
import { popoverSpec, PopoverTriggerAtom } from '../popover/bond.svelte';
import {
	DialogBond,
	type DialogBond as DialogBondInstance,
	type DialogBondProps
} from '../dialog/bond.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type PopoverDialogBondProps = DialogBondProps;

// Fusion of Popover + Dialog: popover's trigger opens a modal dialog instead of a floating panel.
// Dialog atoms/capabilities win per-slot (last-wins); floating atoms are inert at runtime.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const PopoverDialogBondImpl = fuse({
	name: 'popover-dialog',
	parts: [{ spec: popoverSpec }, DialogBond],
	atoms: { trigger: PopoverTriggerAtom }
});

// Narrows fuse()'s default props slot so PropsOf resolves correctly.
export type PopoverDialogBond = BondOf<typeof PopoverDialogBondImpl> &
	DialogBondInstance & {
		readonly __props?: PopoverDialogBondProps;
		readonly props: PopoverDialogBondProps;
	};

// Constructor facade (TabsBond pattern): re-types new/get/set to prop-narrowed instance.
interface PopoverDialogBondConstructor {
	new (props: PopoverDialogBondProps): PopoverDialogBond;
	readonly CONTEXT_KEY: string;
	get(): PopoverDialogBond | undefined;
	set(bond: PopoverDialogBond): PopoverDialogBond;
}

export const PopoverDialogBond = PopoverDialogBondImpl as unknown as PopoverDialogBondConstructor;
