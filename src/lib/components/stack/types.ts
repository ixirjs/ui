import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Snippet } from 'svelte';

// Stack Snippet Props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StackSnippetProps extends SnippetProps {}

export type StackChildren = Snippet<[StackSnippetProps]>;

export interface StackRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StackChildren> {
	// The value of the topmost (front) item — bindable, updates reactively.
	value?: string;
}

export interface StackItemProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StackChildren> {
	// Unique identifier for this stack item.
	value: string;
}
