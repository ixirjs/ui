import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { DividerProps } from '$ixirjs/ui/components/divider';

// List Snippet Props

export interface ListSnippetProps extends SnippetProps {}

export type ListChildren = Snippet;

export interface ListRootProps<
	E extends HtmlElementTagName = 'ul',
	B extends Base = Base
> extends RenderProps<E, B, ListChildren> {}

export interface ListGroupProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, ListChildren> {}

export interface ListItemProps<
	E extends HtmlElementTagName = 'li',
	B extends Base = Base
> extends RenderProps<E, B, ListChildren> {}

export interface ListTitleProps<
	E extends HtmlElementTagName = 'h3',
	B extends Base = Base
> extends RenderProps<E, B, ListChildren> {}

export interface ListDividerProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends DividerProps<E, B> {
	/** Content of this part. */
	children?: never;
}
