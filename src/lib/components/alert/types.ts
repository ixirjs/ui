import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { AlertBond } from './bond.svelte';

// Alert Snippet Props
export interface AlertSnippetProps extends SnippetProps {
	alert: AlertBond;
}

export type AlertChildren = Snippet<[AlertSnippetProps]>;

// Alert Root Props
export interface AlertRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AlertChildren> {
	disabled?: boolean;
	extend?: Record<string, unknown>;
	factory?: Factory<AlertBond>;
}

// Alert Sub-component Props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AlertChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertTitleProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AlertChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AlertChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertIconProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AlertChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertActionsProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AlertChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertCloseButtonProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends HtmlAtomProps<E, B, AlertChildren> {}
