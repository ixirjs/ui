import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { LayerRelation, PortalBond, ZIndexInput } from '$ixirjs/ui/components/portal';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';
import type { DrawerBond } from './bond.svelte';

// Declaration-merge into these to add app-specific props per drawer part.
export interface DrawerExtendProps {}

export interface DrawerContentExtendProps {}

export interface DrawerHeaderExtendProps {}

export interface DrawerBodyExtendProps {}

export interface DrawerFooterExtendProps {}

export interface DrawerTitleExtendProps {}

export interface DrawerDescriptionExtendProps {}

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

// Plain `extends` (not `Override<...>`): an Omit-based Override over RenderProps' `[key: string]:
// unknown` index signature collapses every un-overridden named prop (children, transition hooks, …) to
// `unknown`. The transition hooks (initial/enter/exit) are the standard 1-arg element signatures —
// the drawer's default animation is passed through Kernel's internal `defaults` layer and forwarded to <Teleport>.
export interface SlideoverRootProps<E extends HtmlElementTagName, B extends Base = Base>
	extends RenderProps<E, B, DrawerChildren>, DrawerExtendProps {
	/** Explicit z-index for the drawer surface. */
	'z-index'?: ZIndexInput;
	/** Position relative to a named portal elevation anchor. */
	order?: LayerRelation;
	/**
	 * Controls whether the drawer is open. Bind this prop for controlled usage.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Disables the drawer trigger, preventing the drawer from being opened.
	 * @default false
	 */
	disabled?: boolean;
	/** Which edge of the screen the drawer slides in from. Controls the slide animation direction. */
	side?: 'left' | 'right' | 'top' | 'bottom';
	/** CSS positioning for the drawer surface. `fixed` pins it to the viewport, `absolute` to the nearest positioned ancestor. */
	position?: 'absolute' | 'fixed';
	/** Portal surface to render into, by id or Bond. Defaults to the nearest active portal. */
	portal?: string | PortalBond;
	/** Per-instance presentation overrides for bonded Drawer parts. */
	presets?: DrawerPresets | undefined;
	/** Native close event handler for the rendered dialog element. */
	onclose?: ((event: Event) => void) | undefined;
	/** Called after a real open-state transition commits; dismissal events and reasons are included when available. */
	onopenchange?: StateChangeCallback<boolean, DrawerBond> | undefined;
	/** Custom factory function to create a DrawerBond instance with custom logic. */
	factory?: Factory<DrawerBond>;
}

export interface SlideoverContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DrawerChildren> {}

export interface SlideoverHeaderProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DrawerChildren> {}

export interface DrawerBodyProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DrawerChildren> {}

export interface SlideoverFooterProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DrawerChildren> {}

export interface SlideoverTitleProps<
	E extends HtmlElementTagName = 'h2',
	B extends Base = Base
> extends RenderProps<E, B, DrawerChildren> {}

export interface SlideoverDescriptionProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B, DrawerChildren> {}

export interface SlideoverBackdropProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, DrawerChildren> {}
