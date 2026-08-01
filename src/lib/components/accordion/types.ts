import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { AccordionBond } from './bond.svelte';

// Accordion Snippet Props
export interface AccordionSnippetProps extends SnippetProps {
	accordion: AccordionBond;
}

export type AccordionChildren = Snippet<[AccordionSnippetProps]>;

// Accordion Root Props
export interface AccordionRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AccordionChildren> {
	value?: string;
	values?: string[];
	data?: unknown;
	multiple?: boolean;
	collapsible?: boolean;
	disabled?: boolean;
	factory?: Factory<AccordionBond>;
}
