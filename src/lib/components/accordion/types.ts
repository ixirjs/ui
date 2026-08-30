import type { Snippet } from 'svelte';
import type { PlainPartProps, SnippetProps } from '$ixirjs/ui/authoring';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/authoring';
import type { AccordionBond } from './bond.svelte';

// Accordion Snippet Props
export interface AccordionSnippetProps extends SnippetProps {
	accordion: AccordionBond;
}

export type AccordionChildren = Snippet<[AccordionSnippetProps]>;

/** Per-instance presentation layers for the Accordion root Bond. */
export interface AccordionPresets extends BondPresetLayers {
	root?: PresetLike;
}

// Accordion Root Props
// The root IS its `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export interface AccordionRootProps extends PlainPartProps<'div', AccordionChildren> {
	/** The value of the currently open item (controlled single-item mode) */
	value?: string;
	/** Array of currently open item values (controlled multiple-item mode) */
	values?: string[];
	/** Arbitrary payload carried on the Bond, returned by lookups and snippet props. */
	data?: unknown;
	/**
	 * Allow multiple accordion items to be open simultaneously
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Allow all items to be collapsed (no forced-open item)
	 * @default false
	 */
	collapsible?: boolean;
	/**
	 * Disable all accordion items
	 * @default false
	 */
	disabled?: boolean;
	/** Custom factory for the accordion bond, enabling advanced behavioral customization */
	factory?: Factory<AccordionBond>;
	/** Per-instance presentation overrides for the Accordion root Bond. */
	presets?: AccordionPresets | undefined;
	/** Single-mode callback; runs after the selected value commits. */
	onvaluechange?: StateChangeCallback<string | undefined, AccordionBond> | undefined;
	/** Multiple-mode callback; runs after the set of open values commits. */
	onvalueschange?: StateChangeCallback<string[], AccordionBond> | undefined;
}
