import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LinkSnippetProps extends SnippetProps {}

export type LinkChildren = Snippet<[LinkSnippetProps]>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LinkProps<
	E extends keyof HTMLElementTagNameMap = 'a',
	B extends Base = Base
> extends HtmlAtomProps<E, B, LinkChildren> {}
