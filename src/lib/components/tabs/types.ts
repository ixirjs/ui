import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { TabsBond } from './bond.svelte';
import type { TabBond } from './tab/bond.svelte';

// Snippet props
export interface TabsSnippetProps extends SnippetProps {
	tabs: TabsBond;
}

export type TabsChildren = Snippet<[TabsSnippetProps]>;

export interface TabSnippetProps extends SnippetProps {
	tab: TabBond<unknown> | undefined;
}

export type TabChildren = Snippet<[TabSnippetProps]>;

export interface TabsRootProps<
	D extends string = string,
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabsChildren> {
	value?: D;
	factory?: Factory<TabsBond>;
	onchange?: (value: D) => void;
}

export interface TabHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabChildren> {
	onclick?: (ev: PointerEvent, context: { tab?: TabBond<unknown> }) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabsChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabsChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TabsChildren> {}
