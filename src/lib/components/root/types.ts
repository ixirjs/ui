import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Snippet } from 'svelte';

export type RootPortals = 'root.l0';

export interface RootSnippetProps extends SnippetProps {}

export type RootChildren = Snippet<[RootSnippetProps]>;

export interface RootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B> {
	// Additional portal configuration rendered inside the default root portal host.
	portal?: Snippet;
}
