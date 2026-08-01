import type { Component, Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';

// Icon snippet props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconSnippetProps extends SnippetProps {}

export type IconChildren = Snippet<[IconSnippetProps]>;

export interface IconProps<
	Src extends Component = Component,
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, IconChildren> {
	src?: Src;
}
