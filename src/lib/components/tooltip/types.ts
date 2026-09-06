import type { Snippet } from 'svelte';
import type { OmitKey } from '$ixirjs/ui/types';
import type { RenderProps, Base, SnippetProps, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type {
	PopoverPresets,
	PopoverRootProps,
	PopoverContentProps
} from '$ixirjs/ui/components/popover';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { TooltipBond } from './bond.svelte';

// Tooltip Snippet Props

export interface TooltipSnippetProps extends SnippetProps {}

export type TooltipChildren = Snippet<[TooltipSnippetProps]>;

/** Per-instance presentation layers for Tooltip's Popover-backed parts. */
export type TooltipPresets = PopoverPresets;

export type TooltipRootProps = OmitKey<PopoverRootProps, 'onopenchange' | 'presets'> & {
	/** Per-instance presentation overrides for this family’s compound slots. */
	presets?: TooltipPresets | undefined;
	/** Called after a real open-state transition commits; pointer and dismissal details are included when available. */
	onopenchange?: StateChangeCallback<boolean, TooltipBond> | undefined;
};

export interface TooltipTriggerProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, TooltipChildren> {
	/** Tooltip body — a plain string, or a snippet for rich content. */
	content?: string | Snippet<[TooltipSnippetProps]>;
	/** Preferred side to place the tooltip on, relative to the trigger. */
	placement?: 'top' | 'bottom' | 'left' | 'right';
	/** Delay in milliseconds before the tooltip opens on hover. */
	delay?: number;
}

// `Tooltip.Content` renders `Popover.Content` directly (see tooltip-content.svelte), so its props
// are Popover's. Named here so the type exists where consumers and the docs look for it.
export type TooltipContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = PopoverContentProps<E, B>;
