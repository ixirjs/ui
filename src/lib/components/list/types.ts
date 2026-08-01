import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { DividerProps } from '$ixirjs/ui/components/divider';

// List Snippet Props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListSnippetProps extends SnippetProps {}

export type ListChildren = Snippet;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListRootProps<
	E extends keyof HTMLElementTagNameMap = 'ul',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ListChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListGroupProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ListChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListItemProps<
	E extends keyof HTMLElementTagNameMap = 'li',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ListChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListTitleProps<
	E extends keyof HTMLElementTagNameMap = 'h3',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ListChildren> {}

export interface ListDividerProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends DividerProps<E, B> {
	children?: never;
}
