import { type Component, type Snippet } from 'svelte';
import { type RenderProps, type SnippetProps } from '$ixirjs/ui/components/atom';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';

export interface CheckboxSnippetProps extends SnippetProps {
	checked?: boolean;
	indeterminate?: boolean;
}

export type CheckboxChildren = Snippet<[CheckboxSnippetProps]>;

export interface CheckboxPresets {
	/** Presentation layer for the internal checkmark slot. */
	checkmark?: PresetLike;
	/** Presentation layer for the internal indeterminate slot. */
	indeterminate?: PresetLike;
}

export interface CheckboxProps extends RenderProps<'button', never, CheckboxChildren> {
	/** The value attribute for group binding. Used alongside the group prop. */
	value?: string;
	/** Bindable array for multi-checkbox group management (similar to Svelte bind:group) */
	group?: string[];
	/**
	 * Whether the checkbox is checked. Supports two-way binding with bind:checked.
	 * @default false
	 */
	checked?: boolean;
	/**
	 * Whether the checkbox is in the indeterminate state (partially selected group)
	 * @default false
	 */
	indeterminate?: boolean;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** DOM id. Falls back to one derived from the Bond’s identity seed. */
	id?: string;
	/** Form field name, submitted with the form. */
	name?: string;
	/** Custom content to render inside the checkbox when it is checked (e.g., a checkmark icon) */
	checkedContent?: Component | Snippet;
	/** Custom content to render when the checkbox is in the indeterminate state */
	indeterminateContent?: Component | Snippet;
	/** Per-instance presentation overrides for compound slots. */
	presets?: CheckboxPresets;
	// Semantic state callback; runs after `checked` commits.
	/** Semantic callback fired after the checked state commits. Receives `(checked, { event })`. */
	oncheckedchange?: StateChangeCallback<boolean>;
	// Native DOM callbacks retain their event-only signatures.
	/** Native click event. */
	onclick?: (event: MouseEvent) => void;
	/** Native change-event callback. Receives only the DOM event. */
	onchange?: (event: Event) => void;
	/** Native input-event callback. Receives only the DOM event. */
	oninput?: (event: Event) => void;
	/** Native blur event, fired when the element loses focus. */
	onblur?: (event: FocusEvent) => void;
	/** Native focus event, fired when the element gains focus. */
	onfocus?: (event: FocusEvent) => void;
}
