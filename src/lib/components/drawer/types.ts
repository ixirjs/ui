import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { LayerRelation, PortalBond, ZIndexInput } from '$ixirjs/ui/components/portal';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';
import type { DrawerBond } from './bond.svelte';

// Declaration-merge into these to add app-specific props per drawer part.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerContentExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerHeaderExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerBodyExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerFooterExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerTitleExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerDescriptionExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerBackdropExtendProps {}

// Snippet props
export interface DrawerSnippetProps extends SnippetProps {
	drawer: DrawerBond;
}

export type DrawerChildren = Snippet<[DrawerSnippetProps]>;

/** Per-instance presentation layers for Drawer’s bonded parts. */
export interface DrawerPresets extends BondPresetLayers {
	root?: PresetLike;
	content?: PresetLike;
	header?: PresetLike;
	title?: PresetLike;
	description?: PresetLike;
	body?: PresetLike;
	footer?: PresetLike;
	backdrop?: PresetLike;
}

// Plain `extends` (not `Override<...>`): an Omit-based Override over HtmlAtomProps' `[key: string]:
// unknown` index signature collapses every un-overridden named prop (children, transition hooks, …) to
// `unknown`. The transition hooks (initial/enter/exit) are the standard 1-arg element signatures —
// the drawer's default animation is passed internally via HtmlAtom's `defaults` layer, and they forward to <Teleport>.
export interface SlideoverRootProps<E extends keyof HTMLElementTagNameMap, B extends Base = Base>
	extends HtmlAtomProps<E, B, DrawerChildren>, DrawerExtendProps {
	'z-index'?: ZIndexInput;
	/** Position relative to a named portal elevation anchor. */
	order?: LayerRelation;
	open?: boolean;
	disabled?: boolean;
	side?: 'left' | 'right' | 'top' | 'bottom';
	position?: 'absolute' | 'fixed';
	portal?: string | PortalBond;
	/** Per-instance presentation overrides for bonded Drawer parts. */
	presets?: DrawerPresets | undefined;
	/** Native close event handler for the rendered dialog element. */
	onclose?: ((event: Event) => void) | undefined;
	onopenchange?: StateChangeCallback<boolean, DrawerBond> | undefined;
	factory?: Factory<DrawerBond>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverFooterProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverTitleProps<
	E extends keyof HTMLElementTagNameMap = 'h2',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverBackdropProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}
