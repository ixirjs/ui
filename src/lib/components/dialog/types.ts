import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { LayerRelation, PortalBond, ZIndexInput } from '$ixirjs/ui/components/portal';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';
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
> extends HtmlAtomProps<E, B, DialogChildren> {
	open?: boolean;
	disabled?: boolean;
	'z-index'?: ZIndexInput;
	/** Position relative to a named portal elevation anchor. */
	order?: LayerRelation;
	/** Modal (default) traps focus and blocks the background; non-modal preserves background access. */
	type?: 'modal' | 'non-modal' | undefined;
	portal?: string | PortalBond;
	/** Per-instance presentation overrides for bonded Dialog parts. */
	presets?: DialogPresets | undefined;
	factory?: (props: DialogBondProps) => DialogBond;
	onopenchange?: StateChangeCallback<boolean, DialogBond> | undefined;
	/** Native click handler for the rendered dialog element. */
	onclick?: ((event: MouseEvent) => void) | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogFooterProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogTitleProps<
	E extends keyof HTMLElementTagNameMap = 'h2',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

export interface DialogCloseButtonProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {
	// Explicit so the close button can preserve native handlers before built-in activation.
	onclick?: ((event: MouseEvent) => void) | undefined;
	onkeydown?: ((event: KeyboardEvent) => void) | undefined;
}
