import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PortalOuterExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TeleportExtendProps {}

export type PortalOuterProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, PortalChildren> &
	PortalOuterExtendProps & {
		id: PortalId;
		children?: Snippet;
		factory?: Factory<PortalBond>;
	};

export type ActivePortalProps = {
	// Portal to make active for descendants: a registry id or a PortalBond instance.
	// Omitted targets resolve to the ambient portal, then the root portal.
	portal?: PortalTarget | undefined;
	children?: Snippet;
};

export type TeleportProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base,
	Children extends Snippet<unknown[]> = PortalChildren
> = HtmlAtomProps<E, B, Children> &
	TeleportExtendProps & {
		portal?: PortalTarget | undefined;
	};

export type PortalSurfaceChildren = Snippet<[{ portal: PortalBond; z: number | undefined }]>;

export interface PortalSurfaceProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, PortalSurfaceChildren> {
	portal?: PortalTarget | undefined;
	owner?: OverlayView | undefined;
	band?: LayerInput | undefined;
	order?: LayerRelation | undefined;
	'z-index'?: ZIndexInput | undefined;
	children?: PortalSurfaceChildren;
}
