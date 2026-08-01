import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
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
	/** Per-instance presentation overrides for the Accordion root Bond. */
	presets?: AccordionPresets | undefined;
	// Single-mode callback; runs after the selected value commits.
	onvaluechange?: StateChangeCallback<string | undefined, AccordionBond> | undefined;
	// Multiple-mode callback; runs after the selected values commit.
	onvalueschange?: StateChangeCallback<string[], AccordionBond> | undefined;
}
