import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory, Override } from '$ixirjs/ui/types';
import type { PresetKey } from '$ixirjs/ui/preset';
import type { ScrollableBond } from './bond.svelte';

// `Override` collapses HtmlAtomProps' named props into its index signature, so
// `preset` must be re-declared on each Props interface below to keep its type.

export interface ScrollableSnippetProps extends SnippetProps {
	scrollable: ScrollableBond;
}

export type ScrollableChildren = Snippet<[ScrollableSnippetProps]>;

export interface ScrollableRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends Override<HtmlAtomProps<E, B, ScrollableChildren>, { children?: ScrollableChildren }> {
	factory?: Factory<ScrollableBond>;
	scrollX?: number;
	scrollY?: number;
	scrollWidth?: number;
	scrollHeight?: number;
	clientWidth?: number;
	clientHeight?: number;
	disabled?: boolean;
	open?: boolean;
	preset?: PresetKey;
}

export interface ScrollableContainerProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends Override<HtmlAtomProps<E, B, ScrollableChildren>, { children?: Snippet }> {
	preset?: PresetKey;
}

export interface ScrollableContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends Override<HtmlAtomProps<E, B, ScrollableChildren>, { children?: Snippet }> {
	preset?: PresetKey;
}

export interface ScrollableTrackProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends Override<HtmlAtomProps<E, B, ScrollableChildren>, { children?: Snippet }> {
	orientation: 'horizontal' | 'vertical';
	preset?: PresetKey;
}

export interface ScrollableThumbProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends Override<HtmlAtomProps<E, B, ScrollableChildren>, { children?: Snippet }> {
	orientation: 'horizontal' | 'vertical';
	preset?: PresetKey;
}
