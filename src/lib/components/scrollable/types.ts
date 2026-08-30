import type { Snippet } from 'svelte';
import type { RenderProps, Base, SnippetProps, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { Factory, Override } from '$ixirjs/ui/types';
import type { PresetKey } from '$ixirjs/ui/preset';
import type { ScrollableBond } from './bond.svelte';

// `Override` collapses RenderProps' named props into its index signature, so
// `preset` must be re-declared on each Props interface below to keep its type.

export interface ScrollableSnippetProps extends SnippetProps {
	scrollable: ScrollableBond;
}

export type ScrollableChildren = Snippet<[ScrollableSnippetProps]>;

export interface ScrollableRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends Override<
	RenderProps<E, B, ScrollableChildren>,
	{
		/** Content of this part. */
		children?: ScrollableChildren;
	}
> {
	/** Custom factory for creating the scrollable bond instance. */
	factory?: Factory<ScrollableBond>;
	/**
	 * Current horizontal scroll position in pixels. Bindable for programmatic control.
	 * @default 0
	 */
	scrollX?: number;
	/**
	 * Current vertical scroll position in pixels. Bindable for programmatic control.
	 * @default 0
	 */
	scrollY?: number;
	/**
	 * Total scrollable width of the content area in pixels. Read-only via binding.
	 * @default 0
	 */
	scrollWidth?: number;
	/**
	 * Total scrollable height of the content area in pixels. Read-only via binding.
	 * @default 0
	 */
	scrollHeight?: number;
	/**
	 * Visible width of the scrollable container in pixels. Read-only via binding.
	 * @default 0
	 */
	clientWidth?: number;
	/**
	 * Visible height of the scrollable container in pixels. Read-only via binding.
	 * @default 0
	 */
	clientHeight?: number;
	/**
	 * Disables the scrollbar interaction when true.
	 * @default false
	 */
	disabled?: boolean;
	/**
	 * Controls whether the scrollbar is visible. Bindable for external control.
	 * @default false
	 */
	open?: boolean;
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: PresetKey;
}

export interface ScrollableContainerProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends Override<
	RenderProps<E, B, ScrollableChildren>,
	{
		/** Content of this part. */
		children?: Snippet;
	}
> {
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: PresetKey;
}

export interface ScrollableContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends Override<
	RenderProps<E, B, ScrollableChildren>,
	{
		/** Content of this part. */
		children?: Snippet;
	}
> {
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: PresetKey;
}

export interface ScrollableTrackProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends Override<
	RenderProps<E, B, ScrollableChildren>,
	{
		/** Content of this part. */
		children?: Snippet;
	}
> {
	/** Required. Specifies whether this track controls horizontal or vertical scrolling. */
	orientation: 'horizontal' | 'vertical';
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: PresetKey;
}

export interface ScrollableThumbProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends Override<
	RenderProps<E, B, ScrollableChildren>,
	{
		/** Content of this part. */
		children?: Snippet;
	}
> {
	/** Required. Specifies whether this thumb controls horizontal or vertical scrolling. */
	orientation: 'horizontal' | 'vertical';
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: PresetKey;
}
