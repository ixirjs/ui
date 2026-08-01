import type { Snippet } from 'svelte';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { SidebarBond } from './bond.svelte';
import type { Base, HtmlAtomProps, SnippetProps } from '$ixirjs/ui/components/atom';
import type { PortalBond, ZIndexInput } from '$ixirjs/ui/components/portal';

// Sidebar Snippet Props

export interface SidebarSnippetProps extends SnippetProps {
	sidebar: SidebarBond;
}

export type SidebarChildren = Snippet<[SidebarSnippetProps]>;

export type SidebarRootProps = {
	class?: string;
	'z-index'?: ZIndexInput;
	open?: boolean;
	disabled?: boolean;
	width?: string | number;
	/**
	 * Render as a portal-owned modal surface instead of an in-flow rail.
	 * Structural — read once at mount, not toggled at runtime.
	 */
	overlay?: boolean;
	/** Portal target when `overlay` is set; defaults through explicit → ambient → root. */
	portal?: string | PortalBond;
	factory?: Factory<SidebarBond>;
	onopenchange?: StateChangeCallback<boolean, SidebarBond> | undefined;
	children?: SidebarChildren;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SidebarContentProps<
	E extends keyof HTMLElementTagNameMap,
	B extends Base = Base
> extends HtmlAtomProps<E, B, SidebarChildren> {}
