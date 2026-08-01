import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';

// Tooltip Snippet Props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TooltipSnippetProps extends SnippetProps {}

export type TooltipChildren = Snippet<[TooltipSnippetProps]>;

export interface TooltipTriggerProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, TooltipChildren> {
	content?: string | Snippet<[TooltipSnippetProps]>;
	placement?: 'top' | 'bottom' | 'left' | 'right';
	delay?: number;
}
