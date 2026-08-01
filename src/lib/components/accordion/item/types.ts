import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';
import type { AccordionItemBond } from './bond.svelte';

// Accordion Item Snippet Props
export interface AccordionItemSnippetProps extends SnippetProps {
	accordionItem: AccordionItemBond;
}

export type AccordionItemChildren = Snippet<[AccordionItemSnippetProps]>;

/** Per-instance presentation layers for an Accordion item Bond. */
export interface AccordionItemPresets extends BondPresetLayers {
	root?: PresetLike;
	header?: PresetLike;
	body?: PresetLike;
	indicator?: PresetLike;
}

export interface AccordionItemRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AccordionItemChildren> {
	value?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any;
	disabled?: boolean;
	factory?: Factory<AccordionItemBond>;
	/** Per-instance presentation overrides for the Accordion item Bond. */
	presets?: AccordionItemPresets | undefined;
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
