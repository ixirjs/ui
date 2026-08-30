import type { Component, Snippet } from 'svelte';
import type { RenderProps, Base, SnippetProps, HtmlElementTagName } from '$ixirjs/ui/authoring';

// Icon snippet props

export interface IconSnippetProps extends SnippetProps {}

export type IconChildren = Snippet<[IconSnippetProps]>;

export interface IconProps<
	Src extends Component = Component,
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, IconChildren> {
	/** Icon component to render. No icon set is bundled — pass one from any library, or supply an SVG as children instead. */
	src?: Src;
}
