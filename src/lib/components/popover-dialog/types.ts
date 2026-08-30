import type { Snippet } from 'svelte';
import type { Base, RenderProps, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { PopoverDialogBond } from './bond.svelte';
import type { PortalTarget, ZIndexInput } from '$ixirjs/ui/components/portal';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/authoring';

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
	_E extends HtmlElementTagName = 'dialog',
	_B extends Base = Base
> {
	/** Bindable open state, shared by the popover and dialog presentations. */
	open?: boolean;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Per-instance presentation overrides for the fused Popover/Dialog parts. */
	presets?: PopoverDialogPresets | undefined;
	/** Semantic callback; runs after the open state commits. */
	onopenchange?: StateChangeCallback<boolean, PopoverDialogBond> | undefined;
	/** Content of this part. */
	children?: Slot;
}

// Dialog owns the modal presentation: self-portals the backdrop around `<Dialog.Content>`.
export interface PopoverDialogContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, Slot> {
	/** Whether the dialog presentation traps focus and blocks the page behind it. */
	type?: 'modal' | 'non-modal';
	/** Explicit z-index for the content surface. */
	'z-index'?: ZIndexInput;
	/** Portal surface to render the content into, by id or Bond. */
	portal?: PortalTarget;
	/** Content of this part. */
	children?: Slot;
	/** Native click handler for the rendered dialog element. */
	onclick?: ((event: MouseEvent) => void) | undefined;
}
