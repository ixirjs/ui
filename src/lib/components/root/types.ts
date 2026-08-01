import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Snippet } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RootSnippetProps extends SnippetProps {}

export type RootChildren = Snippet<[RootSnippetProps]>;

export interface RootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {
	// Custom portal configuration snippet (rendered in place of the default Portal.Outer/Inner).
	portal?: Snippet;
}
