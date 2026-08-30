import type { Snippet } from 'svelte';
import type { RenderProps, Base, SnippetProps } from '$ixirjs/ui/authoring';
import type { Factory } from '$ixirjs/ui/types';
import type { AlertBond } from './bond.svelte';

// Alert Snippet Props
export interface AlertSnippetProps extends SnippetProps {
	alert: AlertBond;
}

export type AlertChildren = Snippet<[AlertSnippetProps]>;

// Alert Root Props
export interface AlertRootProps extends RenderProps<'div', Base, AlertChildren> {
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

export interface AlertContentProps extends RenderProps<'div', Base, AlertChildren> {}

export interface AlertTitleProps extends RenderProps<'div', Base, AlertChildren> {}

export interface AlertDescriptionProps extends RenderProps<'div', Base, AlertChildren> {}

export interface AlertIconProps extends RenderProps<'div', Base, AlertChildren> {}

export interface AlertActionsProps extends RenderProps<'div', Base, AlertChildren> {}

export interface AlertCloseButtonProps extends RenderProps<'button', Base, AlertChildren> {}
