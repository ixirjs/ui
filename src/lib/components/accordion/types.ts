import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/shared/bond';
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
export interface AccordionRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AccordionChildren> {
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
