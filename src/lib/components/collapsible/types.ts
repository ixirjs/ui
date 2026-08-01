import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { CollapsibleBond } from './bond.svelte';

// Extension points: merge custom props into collapsible parts by augmenting these interfaces.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CollapsibleRootExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CollapsibleHeaderExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CollapsibleBodyExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CollapsibleIndicatorExtendProps {}

// Snippet props
export interface CollapsibleSnippetProps extends SnippetProps {
	collapsible: CollapsibleBond;
}

export type CollapsibleChildren = Snippet<[CollapsibleSnippetProps]>;

export type CollapsibleRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, CollapsibleChildren> &
	CollapsibleRootExtendProps & {
		open?: boolean;
		value?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data?: any;
		disabled?: boolean;
		factory?: Factory<CollapsibleBond>;
	};

export type CollapsibleHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, CollapsibleChildren> & CollapsibleHeaderExtendProps;

export type CollapsibleBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, CollapsibleChildren> & CollapsibleBodyExtendProps;

export type CollapsibleIndicatorProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, CollapsibleChildren> & CollapsibleIndicatorExtendProps;

/** @deprecated Use `CollapsibleRootExtendProps` instead. */
export type CollapsibleExtendProps = CollapsibleRootExtendProps;
