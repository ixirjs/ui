import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { PortalBond } from './bond.svelte';
import type { RootPortals } from '$svelte-atoms/core/components/root/root.svelte';
import type { HtmlElementTagName } from '$svelte-atoms/core/components/element';

export interface PortalSnippetProps extends SnippetProps {
	portal: PortalBond;
}

export type PortalChildren = Snippet<[PortalSnippetProps]>;

export type PortalRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, PortalChildren> & {
	name?: string;
	factory?: Factory<PortalBond>;
};

export type PortalOuterProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, PortalChildren> & {
	id: RootPortals | (string & {});
	children?: Snippet;
};

export type ActivePortalProps = {
	// Portal to make active for descendants: a registry id or a PortalBond instance.
	portal: RootPortals | (string & {}) | PortalBond;
	children?: Snippet;
};

export type TeleportProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base,
	Children extends Snippet<unknown[]> = PortalChildren
> = HtmlAtomProps<E, B, Children> & {
	portal?: string | PortalBond;
};
