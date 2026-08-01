import { type Component, type Snippet } from 'svelte';
import { type HtmlAtomProps, type SnippetProps } from '$ixirjs/ui/components/atom';
import type { StateChangeCallback } from '$ixirjs/ui/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RadioSnippetProps extends SnippetProps {}

export type RadioChildren = Snippet<[RadioSnippetProps]>;

export interface RadioProps<T = string> extends HtmlAtomProps<'label', never, RadioChildren> {
	value?: T;
	// Currently selected value (for standalone radios).
	group?: T;
	id?: string;
	name?: string;
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;
	// Custom content shown when the radio is checked.
	checkedContent?: Component | Snippet;
	// Semantic item-state callback; runs after this item's checked state commits.
	oncheckedchange?: StateChangeCallback<boolean>;
	// Native DOM callbacks retain their event-only signatures.
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
}

export interface RadioGroupProps<T = string> extends HtmlAtomProps<'div', never, RadioChildren> {
	value?: T;
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;
	// Name attribute shared by all radio buttons in the group.
	name?: string;
	// Semantic group-state callback; runs after the selected value commits.
	onvaluechange?: StateChangeCallback<T>;
	// Native DOM callbacks receive bubbling item events only.
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
}
