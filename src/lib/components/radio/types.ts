import { type Component, type Snippet } from 'svelte';
import { type HtmlAtomProps, type SnippetProps } from '$svelte-atoms/core/components/atom';

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
	onchange?: (ev: Event, options?: { checked: boolean; value: boolean; type: 'boolean' }) => void;
	oninput?: (ev: Event, options?: { checked: boolean; value: boolean; type: 'boolean' }) => void;
}

export interface RadioGroupProps<T = string> extends HtmlAtomProps<'div', never, RadioChildren> {
	value?: T;
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;
	// Name attribute shared by all radio buttons in the group.
	name?: string;
	// Fired when the selected value changes.
	oninput?: (ev: CustomEvent, options?: { value: T }) => void;
}
