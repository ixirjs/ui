import { fuse, type BondOf } from '$svelte-atoms/core/shared';
import { popoverSpec, PopoverTriggerAtom } from '../popover/bond.svelte';
import { DialogBond, DialogBondState, type DialogBondProps } from '../dialog/bond.svelte';

export type PopoverDialogBondProps = DialogBondProps;

// State for PopoverDialogBond — extends DialogBondState; no positioning state (opens modal, not floating).
export class PopoverDialogBondState<
	Props extends PopoverDialogBondProps = PopoverDialogBondProps
> extends DialogBondState<Props> {}

// Fusion of Popover + Dialog (§9.4.1): popover's trigger opens a modal dialog instead of a floating panel.
// Dialog atoms/capabilities win per-slot (last-wins); floating atoms are inert at runtime.
const PopoverDialogBondImpl = fuse({
	name: 'popover-dialog',
	parts: [{ spec: popoverSpec }, DialogBond],
	atoms: { trigger: PopoverTriggerAtom }
});

// Narrows fuse()'s default BondState slot to PopoverDialogBondState so PropsOf resolves correctly.
export type PopoverDialogBond = BondOf<typeof PopoverDialogBondImpl> & {
	readonly state: PopoverDialogBondState;
};

// Constructor facade (TabsBond pattern): re-types new/get/set to state-narrowed instance.
interface PopoverDialogBondConstructor {
	new (state: PopoverDialogBondState): PopoverDialogBond;
	readonly CONTEXT_KEY: string;
	get(): PopoverDialogBond | undefined;
	set(bond: PopoverDialogBond): PopoverDialogBond;
}

export const PopoverDialogBond = PopoverDialogBondImpl as unknown as PopoverDialogBondConstructor;
