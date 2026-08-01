import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';

// List Snippet Props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListSnippetProps extends SnippetProps {}

export type ListChildren = Snippet<[ListSnippetProps]>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ListRootProps<
	E extends keyof HTMLElementTagNameMap = 'ul',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ListChildren> {}
