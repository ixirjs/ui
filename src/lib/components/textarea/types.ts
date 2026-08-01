import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Snippet } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaSnippetProps extends SnippetProps {}

export type TextareaChildren = Snippet<[TextareaSnippetProps]>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TextareaChildren> {}

export interface TextareaInputProps {
	value?: string;
	autoResize?: boolean;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	rows?: number;
	cols?: number;
	maxlength?: number;
	minlength?: number;
	required?: boolean;
	autofocus?: boolean;
	autocomplete?: string;
	spellcheck?: boolean;
	wrap?: 'soft' | 'hard' | 'off';
}
