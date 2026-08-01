import type { Snippet } from 'svelte';
import type { Factory } from '$svelte-atoms/core/types';
import type { SidebarBond } from './bond.svelte';
import type { Base, HtmlAtomProps, SnippetProps } from '../atom';
import type { ZIndexInput } from '../portal';

// Sidebar Snippet Props

export interface SidebarSnippetProps extends SnippetProps {
	sidebar: SidebarBond;
}

export type SidebarChildren = Snippet<[SidebarSnippetProps]>;

export type SidebarRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, SidebarChildren> & {
	'z-index'?: ZIndexInput;
	open?: boolean;
	disabled?: boolean;
	width?: string | number;
	/**
	 * Render as a teleported overlay carrying `ZLayer('modal')` instead of an in-flow rail.
	 * Structural — read once at mount, not toggled at runtime.
	 */
	overlay?: boolean;
	/** Teleport target when `overlay` is set (defaults to the root portal `'root.l0'`). */
	portal?: string;
	factory?: Factory<SidebarBond>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SidebarContentProps<
	E extends keyof HTMLElementTagNameMap,
	B extends Base = Base
> extends HtmlAtomProps<E, B, SidebarChildren> {}
