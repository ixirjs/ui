import type { Snippet } from 'svelte';
import type { SnippetProps, PlainPartProps, RenderProps, Base } from '$ixirjs/ui/authoring';
import type { Factory } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/authoring';
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

// The item root is the composable part of the family: it takes `as`/`base` and honours a preset's
// `render.as`/`render.base` (the docs theme renders it as `<li>`).
export interface AccordionItemRootProps extends RenderProps<'div', Base, AccordionItemChildren> {
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

// The header IS its `<button>`; the body and indicator keep their motion internally.
export interface AccordionItemHeaderProps extends PlainPartProps<'button', AccordionItemChildren> {}

export interface AccordionItemBodyProps extends PlainPartProps<'div', AccordionItemChildren> {}

export interface AccordionItemIndicatorProps extends PlainPartProps<'div', AccordionItemChildren> {}
