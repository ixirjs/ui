import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Snippet } from 'svelte';

export type RootPortals = 'root.l0';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RootSnippetProps extends SnippetProps {}

export type RootChildren = Snippet<[RootSnippetProps]>;

export interface RootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {
	// Additional portal configuration rendered inside the default root portal host.
	portal?: Snippet;
}
