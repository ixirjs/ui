import { type Component, type Snippet } from 'svelte';
import { type RenderProps, type SnippetProps } from '$ixirjs/ui/components/atom';
import type { StateChangeCallback } from '$ixirjs/ui/types';

export interface RadioSnippetProps extends SnippetProps {}

export type RadioChildren = Snippet<[RadioSnippetProps]>;

export interface RadioProps<T = string> extends RenderProps<'label', never, RadioChildren> {
	/** The value this radio button represents. Compared against `group` to determine the checked state. */
	value?: T;
	// Currently selected value (for standalone radios).
	/** The currently selected value. The radio is checked when `group === value`. */
	group?: T;
	/** The id attribute of the radio input element, used for label association. */
	id?: string;
	/** The name attribute of the radio input, groups radios for form submission. */
	name?: string;
	/**
	 * Whether the radio button is disabled and non-interactive.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Whether the radio button is required to be selected for form validation.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether the radio button value is readonly and cannot be changed by the user.
	 * @default false
	 */
	readonly?: boolean;
	// Custom content shown when the radio is checked.
	/** Custom component or snippet rendered in place of the default indicator when the radio is checked. */
	checkedContent?: Component | Snippet;
	// Semantic item-state callback; runs after this item's checked state commits.
	/** Semantic callback fired after this item’s checked state commits for both selection and deselection. The context includes `event` when the native event is available. */
	oncheckedchange?: StateChangeCallback<boolean>;
	// Native DOM callbacks retain their event-only signatures.
	/** Native change-event callback. Receives only the DOM event. */
	onchange?: (event: Event) => void;
	/** Native input-event callback. Receives only the DOM event. */
	oninput?: (event: Event) => void;
}

export interface RadioGroupProps<T = string> extends RenderProps<'div', never, RadioChildren> {
	/** The currently selected value in the group. Bindable for two-way synchronization. */
	value?: T;
	/**
	 * Disables all radio buttons in the group.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Marks all radio buttons in the group as required.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Makes all radio buttons in the group readonly.
	 * @default false
	 */
	readonly?: boolean;
	// Name attribute shared by all radio buttons in the group.
	/** The shared name attribute applied to all radio buttons in the group. */
	name?: string;
	// Semantic group-state callback; runs after the selected value commits.
	/** Semantic callback fired after the selected group value commits. Receives `(value, { event })` with the native item event. */
	onvaluechange?: StateChangeCallback<T>;
	// Native DOM callbacks receive bubbling item events only.
	/** Native callback for change events bubbling from radio items. */
	onchange?: (event: Event) => void;
	/** Native callback for input events bubbling from radio items. */
	oninput?: (event: Event) => void;
}
