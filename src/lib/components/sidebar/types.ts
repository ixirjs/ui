import type { Snippet } from 'svelte';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { SidebarBond } from './bond.svelte';
import type {
	Base,
	RenderProps,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { PortalBond, ZIndexInput } from '$ixirjs/ui/components/portal';

// Sidebar Snippet Props

export interface SidebarSnippetProps extends SnippetProps {
	sidebar: SidebarBond;
}

export type SidebarChildren = Snippet<[SidebarSnippetProps]>;

export type SidebarRootProps = {
	/** Additional classes, merged after the preset so they win. */
	class?: string;
	/** Stacking elevation for the sidebar surface. Takes a named layer rather than a raw number so overlays stay ordered. */
	'z-index'?: ZIndexInput;
	/**
	 * Whether the sidebar panel is currently open. Bindable for two-way control.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Disables the sidebar from being opened or closed.
	 * @default false
	 */
	disabled?: boolean;
	/** Width of the sidebar panel. Accepts CSS values (e.g., "320px", "20rem") or numeric pixel values. */
	width?: string | number;
	/**
	 * Render as a portal-owned modal surface instead of an in-flow rail.
	 * Structural — read once at mount, not toggled at runtime.
	 */
	overlay?: boolean;
	/** Portal target when `overlay` is set; defaults through explicit → ambient → root. */
	portal?: string | PortalBond;
	/** Custom factory for creating the sidebar bond instance. */
	factory?: Factory<SidebarBond>;
	/** Called after a real open-state transition commits. */
	onopenchange?: StateChangeCallback<boolean, SidebarBond> | undefined;
	/** Content of this part. */
	children?: SidebarChildren;
};

export interface SidebarContentProps<
	E extends HtmlElementTagName,
	B extends Base = Base
> extends RenderProps<E, B, SidebarChildren> {}
