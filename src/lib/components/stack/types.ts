import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Snippet } from 'svelte';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { StackBond } from './bond.svelte';

// Stack Snippet Props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StackSnippetProps extends SnippetProps {}

export type StackChildren = Snippet<[StackSnippetProps]>;

export interface StackRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StackChildren> {
	// The value of the topmost (front) item — bindable, updates reactively.
	value?: string | undefined;
	factory?: Factory<StackBond>;
	// Semantic callback; runs after the topmost value commits.
	onvaluechange?: StateChangeCallback<string | undefined, StackBond> | undefined;
}

export interface StackItemProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StackChildren> {
	// Unique identifier for this stack item.
	value: string;
}
