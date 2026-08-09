import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
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
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AccordionItemChildren> {
	/** Unique identifier for this accordion item. Used to control open state programmatically. */
	value?: string;
	/** Arbitrary payload carried on the Bond, returned by lookups and snippet props. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any;
	/**
	 * Disable this accordion item individually
	 * @default false
	 */
	disabled?: boolean;
	/** Custom factory for the item bond, enabling advanced behavioral customization */
	factory?: Factory<AccordionItemBond>;
	/** Per-instance presentation overrides for the Accordion item Bond. */
	presets?: AccordionItemPresets | undefined;
}

export interface AccordionItemHeaderProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AccordionItemChildren> {}

export interface AccordionItemBodyProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AccordionItemChildren> {}

export interface AccordionItemIndicatorProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AccordionItemChildren> {}
