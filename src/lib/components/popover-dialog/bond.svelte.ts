/**
 * PopoverDialog's shared object — the Popover/Dialog fusion as one plain state class on the
 * redesigned `Kernel`.
 *
 * The fusion used to be `defineBond({ parts: [PopoverBond, DialogBond] })`, which merged two
 * capability bundles and two atom maps per slot. There is nothing left to merge: the trigger is
 * `Popover.Trigger` writing `triggerAttrs`/`clickTrigger` literally, and the modal presentation is
 * `useModal(bond)` on `<PopoverDialog.Dialog>`. What remains of the fusion is this one class, an
 * overlay that a popover trigger opens and a dialog surface presents, shared under four context
 * keys so both halves' parts resolve it.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { DialogBondBase, type DialogBondProps } from '$ixirjs/ui/components/dialog/bond.svelte';
import type { OverlayLike } from '$ixirjs/ui/components/overlay/model.svelte';
import type { PopoverDialogPresets } from './types';

export type PopoverDialogBondProps = DialogBondProps & {
	presets?: PopoverDialogPresets | undefined;
};

export const PopoverDialogContext = Kernel.context<PopoverDialogBond>('popover-dialog');

export class PopoverDialogBond extends DialogBondBase<PopoverDialogBondProps> {
	// `Popover.Trigger` starts tracking a floating position on pointer-enter. The modal surface never
	// positions against the trigger, so this is written and never read — kept because the trigger is
	// the popover's own component, not a copy.
	tracking = $state<boolean | undefined>(undefined);

	constructor(props: PopoverDialogBondProps, name = 'popover-dialog') {
		super(props, name);
	}

	// The `OverlayLike` arm exists only to satisfy TS's static-side check against
	// `OverlayBond.create(outer?)`; callers pass props.
	static override create(props: PopoverDialogBondProps | OverlayLike = {}): PopoverDialogBond {
		return new PopoverDialogBond(props as PopoverDialogBondProps);
	}
	static get(): PopoverDialogBond | undefined {
		return PopoverDialogContext.get();
	}
	static getOrThrow(message?: string): PopoverDialogBond {
		return PopoverDialogContext.getOrThrow(message);
	}
}
