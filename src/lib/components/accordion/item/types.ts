import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { AccordionItemBond } from './bond.svelte';

// ============================================================================
// Accordion Item Snippet Props (Extensible)
// ============================================================================

export interface AccordionItemSnippetProps extends SnippetProps {
	accordionItem: AccordionItemBond;
}

export type AccordionItemChildren = Snippet<[AccordionItemSnippetProps]>;

export interface AccordionItemRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AccordionItemChildren> {
	value?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any;
	disabled?: boolean;
	factory?: Factory<AccordionItemBond>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AccordionItemHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AccordionItemChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AccordionItemBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AccordionItemChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AccordionItemIndicatorProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AccordionItemChildren> {}
