import type { Snippet } from 'svelte';
import type { RenderProps, PlainPartProps, Base, SnippetProps } from '$ixirjs/ui/authoring';
import type { LayerRelation, PortalBond, ZIndexInput } from '$ixirjs/ui/components/portal';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/authoring';
import type { DialogBond, DialogBondProps } from './bond.svelte';

export interface DialogSnippetProps extends SnippetProps {
	dialog: DialogBond;
}

export type DialogChildren = Snippet<[DialogSnippetProps]>;

/** Per-instance presentation layers for Dialog's bonded parts. */
export interface DialogPresets extends BondPresetLayers {
	root?: PresetLike;
	content?: PresetLike;
	header?: PresetLike;
	title?: PresetLike;
	description?: PresetLike;
	body?: PresetLike;
	footer?: PresetLike;
	closeButton?: PresetLike;
}

export interface DialogProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DialogChildren> {
	/** Bindable open state. */
	open?: boolean;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Explicit z-index for the dialog surface. Prefer the semantic layer unless resolving a stacking conflict. */
	'z-index'?: ZIndexInput;
	/** Position relative to a named portal elevation anchor. */
	order?: LayerRelation;
	/** Modal (default) traps focus and blocks the background; non-modal preserves background access. */
	type?: 'modal' | 'non-modal' | undefined;
	/** Portal surface to render into, by id or Bond. Defaults to the ambient portal, then the root portal. */
	portal?: string | PortalBond;
	/** Per-instance presentation overrides for bonded Dialog parts. */
	presets?: DialogPresets | undefined;
	/** Replaces the Bond constructor, so a family can be extended or fused. */
	factory?: (props: DialogBondProps) => DialogBond;
	/** Semantic callback; runs after the open state commits. */
	onopenchange?: StateChangeCallback<boolean, DialogBond> | undefined;
	/** Native click handler for the rendered dialog element. */
	onclick?: ((event: MouseEvent) => void) | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DialogChildren> {}

// Every layout part below IS its element — a literal `<div>`/`<h3>`/`<p>` spreading the part's
// attributes — so none takes `as`, `base` or motion. See `PlainPartProps`.

export interface DialogHeaderProps extends PlainPartProps<'div', DialogChildren> {}

export interface DialogBodyProps extends PlainPartProps<'div', DialogChildren> {}

export interface DialogFooterProps extends PlainPartProps<'div', DialogChildren> {}

export interface DialogTitleProps extends PlainPartProps<'h3', DialogChildren> {}

export interface DialogDescriptionProps extends PlainPartProps<'p', DialogChildren> {}

export interface DialogCloseButtonProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends RenderProps<E, B, DialogChildren> {
	// Explicit so the close button can preserve native handlers before built-in activation.
	/** Native click event. */
	onclick?: ((event: MouseEvent) => void) | undefined;
	/** Native keydown event. */
	onkeydown?: ((event: KeyboardEvent) => void) | undefined;
}
