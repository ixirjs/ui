import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { CollapsibleBond } from './bond.svelte';

// Extension points: merge custom props into collapsible parts by augmenting these interfaces.
export interface CollapsibleRootExtendProps {}

export interface CollapsibleHeaderExtendProps {}

export interface CollapsibleBodyExtendProps {}

export interface CollapsibleIndicatorExtendProps {}

// Snippet props
export interface CollapsibleSnippetProps extends SnippetProps {
	collapsible: CollapsibleBond;
}

export type CollapsibleChildren = Snippet<[CollapsibleSnippetProps]>;

export type CollapsibleRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, CollapsibleChildren> &
	CollapsibleRootExtendProps & {
		/**
		 * Whether the collapsible is open. Supports two-way binding with bind:open.
		 * @default false
		 */
		open?: boolean;
		/** Current value of the control. */
		value?: string;
		/** Arbitrary payload carried on the Bond, returned by lookups and snippet props. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: any;
		/**
		 * Disable the collapsible, preventing user interaction
		 * @default false
		 */
		disabled?: boolean;
		/** Replaces the Bond constructor, so a family can be extended or fused. */
		factory?: Factory<CollapsibleBond>;
		/** Semantic callback; runs after the open state commits, not when the toggle is clicked. */
		onopenchange?: StateChangeCallback<boolean, CollapsibleBond>;
	};

export type CollapsibleHeaderProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, CollapsibleChildren> & CollapsibleHeaderExtendProps;

export type CollapsibleBodyProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, CollapsibleChildren> & CollapsibleBodyExtendProps;

export type CollapsibleIndicatorProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, CollapsibleChildren> & CollapsibleIndicatorExtendProps;
