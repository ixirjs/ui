/**
 * Dialog's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ dialog }`, `getBond`, `factory`, `DialogBond.create`,
 * `open`/`close`/`toggle`, `stageOpenChange`), none of the runtime: the modal behaviour is
 * `useModal(bond)` at the root and the policies in `overlay/behavior.svelte.ts`, written literally
 * into each part's attrs. Parts announce their ids with `attachPart`, so the root's
 * `aria-labelledby`/`aria-describedby` and the backdrop's "inside content" test resolve without a
 * registry.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	OverlayBond,
	type OverlayLike,
	type OverlayProps
} from '$ixirjs/ui/components/overlay/model.svelte';
import type { DialogPresets } from './types';

export type DialogBondProps = OverlayProps & {
	disabled?: boolean | undefined;
	presets?: DialogPresets | undefined;
};

export const DialogContext = Kernel.context<DialogBond>('dialog');

// Parts key their preset (`${name}.header`) and their element id (`${name}-header-<seed>`) off
// `name`, so PopoverDialog's fused Bond renders the very same components under `popover-dialog.*`.
export class DialogBondBase<
	Props extends DialogBondProps = DialogBondProps
> extends OverlayBond<Props> {
	constructor(props: Props, name = 'dialog') {
		super(props, name);
	}
}

// Controlled modal disclosure (no trigger — use PopoverDialog for that). Nested popovers teleport
// into the dialog's own in-content PortalHost, so they position against an in-content offsetParent.
export class DialogBond extends DialogBondBase {
	// The `OverlayLike` arm exists only to satisfy TS's static-side check against
	// `OverlayBond.create(outer?)`; callers pass props.
	static override create(props: DialogBondProps | OverlayLike = {}): DialogBond {
		return new DialogBond(props as DialogBondProps);
	}
	static get(): DialogBond | undefined {
		return DialogContext.get();
	}
	static getOrThrow(message?: string): DialogBond {
		return DialogContext.getOrThrow(message);
	}
}
