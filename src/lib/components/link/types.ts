import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';

export interface LinkSnippetProps extends SnippetProps {}

export type LinkChildren = Snippet<[LinkSnippetProps]>;

export interface LinkProps<
	E extends HtmlElementTagName = 'a',
	B extends Base = Base
> extends RenderProps<E, B, LinkChildren> {
	/** The URL the link navigates to. */
	href?: string | undefined;
	/** Where to open the linked URL. Use "_blank" for external links. */
	target?: string | undefined;
	/** Relationship between the current document and the linked URL. Use "noopener noreferrer" for external links. */
	rel?: string | undefined;
}
