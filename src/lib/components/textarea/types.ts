import type { RenderProps, Base, SnippetProps, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { Snippet } from 'svelte';

export interface TextareaSnippetProps extends SnippetProps {}

export type TextareaChildren = Snippet<[TextareaSnippetProps]>;

export interface TextareaRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, TextareaChildren> {}

export interface TextareaInputProps {
	/** The current text value of the textarea. Bindable for two-way sync. */
	value?: string;
	/** Grows the textarea to fit its content instead of scrolling. */
	autoResize?: boolean;
	/** Placeholder text shown when the textarea is empty. */
	placeholder?: string;
	/**
	 * Disables the textarea, preventing user input and applying disabled styling.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Makes the textarea read-only; the value is visible but cannot be changed by the user.
	 * @default false
	 */
	readonly?: boolean;
	/** Number of visible text rows. Determines the initial height of the textarea. */
	rows?: number;
	/** Number of visible text columns. Determines the initial width of the textarea. */
	cols?: number;
	/** Maximum number of characters allowed in the textarea. */
	maxlength?: number;
	/** Minimum number of characters required for form validation. */
	minlength?: number;
	/**
	 * Whether the textarea must have a value for form submission.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Whether the textarea should receive focus automatically when the page loads.
	 * @default false
	 */
	autofocus?: boolean;
	/** Browser autocomplete hint. Use "on", "off", or a specific token like "street-address". */
	autocomplete?: string;
	/** Whether the browser should check spelling in the textarea content. */
	spellcheck?: boolean;
	/** How the textarea wraps text during form submission. "hard" inserts newlines; "soft" does not. */
	wrap?: 'soft' | 'hard' | 'off';
}
