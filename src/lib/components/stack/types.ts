import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Snippet } from 'svelte';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { StackBond } from './bond.svelte';

// Stack Snippet Props

export interface StackSnippetProps extends SnippetProps {}

export type StackChildren = Snippet<[StackSnippetProps]>;

export interface StackRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StackChildren> {
	// The value of the topmost (front) item — bindable, updates reactively.
	/** Bindable. Reflects the id of the topmost (most recently raised) Stack.Item. Updates reactively as z-order changes. */
	value?: string | undefined;
	/**
	 * Custom factory for creating the StackBond instance.
	 * @default built-in
	 */
	factory?: Factory<StackBond>;
	/** Semantic callback; runs after the topmost value commits. */
	onvaluechange?: StateChangeCallback<string | undefined, StackBond> | undefined;
}

export interface StackItemProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StackChildren> {
	/**
	 * Unique identifier for this item within the stack. Used by Bond z-order methods such as bringToFront and sendToBack. Auto-generated if omitted.
	 * @default $props.id()
	 */
	id?: string | undefined;

	// Unique identifier for this stack item.
	/** Current value of the control. */
	value: string;
}
