import { type Component, type Snippet } from 'svelte';
import { type HtmlAtomProps, type SnippetProps } from '$svelte-atoms/core/components/atom';

export interface CheckboxSnippetProps extends SnippetProps {
	checked?: boolean;
	indeterminate?: boolean;
}

export type CheckboxChildren = Snippet<[CheckboxSnippetProps]>;

export interface CheckboxProps extends HtmlAtomProps<'button', never, CheckboxChildren> {
	value?: string;
	group?: string[];
	checked?: boolean;
	indeterminate?: boolean;
	disabled?: boolean;
	id?: string;
	name?: string;
	checkedContent?: Component | Snippet;
	indeterminateContent?: Component | Snippet;
	onclick?: (ev?: Event) => void;
	onchange?: (ev?: Event, options?: { checked: boolean }) => void;
	oninput?: (ev?: Event, options?: { checked: boolean }) => void;
	onblur?: () => void;
	onfocus?: () => void;
}
