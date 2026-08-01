import type { Snippet } from 'svelte';
import type { Base, HtmlAtomProps } from '$ixirjs/ui/components/atom';
import type { PopoverDialogBond } from './bond.svelte';
import type { PortalTarget, ZIndexInput } from '$ixirjs/ui/components/portal';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';

// Children snippets receive the fused bond.
type Slot = Snippet<[{ popoverDialog: PopoverDialogBond }]>;

/** Per-instance presentation layers for PopoverDialog's fused bonded parts. */
export interface PopoverDialogPresets extends BondPresetLayers {
	root?: PresetLike;
	trigger?: PresetLike;
	tail?: PresetLike;
	content?: PresetLike;
	header?: PresetLike;
	title?: PresetLike;
	description?: PresetLike;
	body?: PresetLike;
	footer?: PresetLike;
	closeButton?: PresetLike;
}

// Root provides context + renders children in document flow; trigger renders in place,
// modal presentation self-portals from `<PopoverDialog.Dialog>`.
export interface PopoverDialogRootProps<
	_E extends keyof HTMLElementTagNameMap = 'dialog',
	_B extends Base = Base
> {
	open?: boolean;
	disabled?: boolean;
	/** Per-instance presentation overrides for the fused Popover/Dialog parts. */
	presets?: PopoverDialogPresets | undefined;
	onopenchange?: StateChangeCallback<boolean, PopoverDialogBond> | undefined;
	children?: Slot;
}

// Dialog owns the modal presentation: self-portals the backdrop around `<Dialog.Content>`.
export interface PopoverDialogContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, Slot> {
	type?: 'modal' | 'non-modal';
	'z-index'?: ZIndexInput;
	portal?: PortalTarget;
	children?: Slot;
	/** Native click handler for the rendered dialog element. */
	onclick?: ((event: MouseEvent) => void) | undefined;
}
