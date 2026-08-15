import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { AlertBond } from './bond.svelte';

// Alert Snippet Props
export interface AlertSnippetProps extends SnippetProps {
	alert: AlertBond;
}

export type AlertChildren = Snippet<[AlertSnippetProps]>;

// Alert Root Props
export interface AlertRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AlertChildren> {
	/**
	 * Disable interaction with the alert (e.g., prevent close button)
	 * @default false
	 */
	disabled?: boolean;
	/** Extra capabilities composed onto this Bond at construction. */
	extend?: Record<string, unknown>;
	/** Custom factory for the alert bond, enabling advanced behavioral customization */
	factory?: Factory<AlertBond>;
}

// Alert Sub-component Props

export interface AlertContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AlertChildren> {}

export interface AlertTitleProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AlertChildren> {}

export interface AlertDescriptionProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AlertChildren> {}

export interface AlertIconProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AlertChildren> {}

export interface AlertActionsProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, AlertChildren> {}

export interface AlertCloseButtonProps<
	E extends HtmlElementTagName = 'button',
	B extends Base = Base
> extends RenderProps<E, B, AlertChildren> {}
