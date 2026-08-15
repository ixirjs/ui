import type { Snippet } from 'svelte';
import type { RenderProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { PortalBond } from './instance/bond.svelte';
import type { RootPortals } from '$ixirjs/ui/components/root/types';
import type { HtmlElementTagName } from '$ixirjs/ui/components/element';
import type { OverlayView } from '$ixirjs/ui/components/overlay';
import type { LayerInput, LayerRelation, ZIndexInput } from './layering/z-layer.svelte';

export type PortalId = RootPortals | (string & {});
export type PortalTarget = PortalId | PortalBond;

export interface PortalSnippetProps extends SnippetProps {
	portal: PortalBond;
}

export type PortalChildren = Snippet<[PortalSnippetProps]>;

// Extension points: merge custom props into portal parts by augmenting these interfaces.
// `PortalSurfaceProps` is interface-shaped, so it is augmented directly instead.
export interface PortalOuterExtendProps {}

export interface TeleportExtendProps {}

export type PortalOuterProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, PortalChildren> &
	PortalOuterExtendProps & {
		/** DOM id. Falls back to one derived from the Bond’s identity seed. */
		id: PortalId;
		/** Content of this part. */
		children?: Snippet;
		/** Replaces the Bond constructor, so a family can be extended or fused. */
		factory?: Factory<PortalBond>;
	};

export type ActivePortalProps = {
	// Portal to make active for descendants: a registry id or a PortalBond instance.
	/** Target surface, by id or Bond. Omitted, it resolves to the ambient portal and then the root portal. */
	portal?: PortalTarget | undefined;
	/** Content of this part. */
	children?: Snippet;
};

export type TeleportProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base,
	Children extends Snippet<unknown[]> = PortalChildren
> = RenderProps<E, B, Children> &
	TeleportExtendProps & {
		/** Target surface, by id or Bond. Omitted, it resolves to the ambient portal and then the root portal. */
		portal?: PortalTarget | undefined;
	};

export type PortalSurfaceChildren = Snippet<[{ portal: PortalBond; z: number | undefined }]>;

export interface PortalSurfaceProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, PortalSurfaceChildren> {
	/** Target surface, by id or Bond. Omitted, it resolves to the ambient portal and then the root portal. */
	portal?: PortalTarget | undefined;
	/** Overlay that owns this surface, so dismissal and focus restore route back to it. */
	owner?: OverlayView | undefined;
	/** Named elevation band the surface sits in. Bands order relative to each other, not by raw z-index. */
	band?: LayerInput | undefined;
	/** Orders this surface against a registered layer anchor (sticky-under). */
	order?: LayerRelation | undefined;
	/** Explicit z-index, escaping the band ordering. Prefer `band` unless you have a specific stacking conflict. */
	'z-index'?: ZIndexInput | undefined;
	/** Content of this part. */
	children?: PortalSurfaceChildren;
}
