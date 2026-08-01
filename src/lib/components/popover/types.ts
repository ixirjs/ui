import type { Component, Snippet } from 'svelte';
import type { Placement } from '@floating-ui/dom';
import type { Factory } from '$svelte-atoms/core/types';
import type { PopoverBond } from './bond.svelte';
import type { Base, HtmlAtomProps } from '../atom';
import type { HtmlElementTagName } from '../element';
import type { LayerInput, LayerRelation, PortalBond, TeleportProps } from '../portal';

export type PopoverChildren = Snippet<[{ popover: PopoverBond }]>;

export interface PopoverRootProps {
	open?: boolean;
	disabled?: boolean;
	placements?: Placement[];
	placement?: Placement;
	offset?: number;
	portal?: string | PortalBond;
	extend?: Record<string, unknown>;
	factory?: Factory<PopoverBond>;
	children?: PopoverChildren;
}

export interface AnimateParams {
	x: number;
	y: number;
	xOffset: number;
	yOffset: number;
	open: boolean;
}

export interface PopoverOverlayProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends TeleportProps<E, B, PopoverChildren> {
	portal: string | PortalBond;
	/** Semantic z-index layer for the floating content. Defaults to `'popover'`. */
	layer?: LayerInput | undefined;
	/**
	 * Order the content relative to a registered ZLayer anchor (ADR 0008 D3) — `below` a
	 * sticky header registered via `ZLayer.anchor(...)` puts the popover beneath it.
	 */
	order?: LayerRelation | undefined;
	"z-index"?: number
	children?: PopoverChildren;
}

/**
 * The trigger's measurements, in px, passed to an {@link AnchorSizeFn} each reposition.
 */
export interface AnchorTriggerSize {
	/** The trigger's measured width (`clientWidth`). */
	width: number;
	/** The trigger's computed `min-width` (`0` when `auto`/unset). */
	minWidth: number;
	/** The trigger's computed `max-width` (`Infinity` when `none`/unset). */
	maxWidth: number;
}

/**
 * Computes a content sizing value from the trigger's measurements. Returns any raw CSS length —
 * e.g. `({ width }) => `${width / 2}px`` for half the trigger, or
 * `({ width, maxWidth }) => `${Math.min(width, maxWidth)}px`` to overhang up to its cap.
 * Re-evaluated each reposition, so it tracks the trigger as it resizes.
 */
export type AnchorSizeFn = (trigger: AnchorTriggerSize) => string;

/**
 * A content sizing value: either a raw CSS length (e.g. `'20rem'`, `'min(40ch, 90vw)'`, or
 * `'var(--sa-anchor-width)'` to match the trigger's measured width), or an {@link AnchorSizeFn}
 * that computes one from the trigger's measurements.
 */
export type AnchorSize = AnchorSizeFn | string;

export interface PopoverContentProps<
	T extends HtmlElementTagName,
	B extends Base = Base
> extends HtmlAtomProps<T, B, PopoverChildren> {
	overlay?: Component<PopoverOverlayProps>;
	/** Semantic z-index layer for the floating content. Defaults to `'popover'`. */
	layer?: LayerInput | undefined;
	/** Order the content relative to a registered ZLayer anchor (ADR 0008 D3 — sticky-under). */
	order?: LayerRelation | undefined;
	/**
	 * Fix the content's width. A CSS length, `'var(--sa-anchor-width)'` to match the trigger's
	 * measured width exactly, or an {@link AnchorSizeFn} computed from the trigger.
	 */
	width?: AnchorSize;
	/**
	 * Floor the content's width. A CSS length, `'var(--sa-anchor-width)'` to match the trigger —
	 * right for select/dropdown/combobox menus that align with their trigger — or an
	 * {@link AnchorSizeFn}.
	 */
	minWidth?: AnchorSize;
	/**
	 * Cap the content's width. A CSS length, `'var(--sa-anchor-width)'` to clamp it to never exceed
	 * the trigger, or an {@link AnchorSizeFn}.
	 */
	maxWidth?: AnchorSize;
	onclickoutside?: (ev: PointerEvent, atom: PopoverBond) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PopoverIndicatorProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, PopoverChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PopoverArrowProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, PopoverChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PopoverTriggerProps<
	T extends keyof HTMLElementTagNameMap,
	B extends Base = Base
> extends HtmlAtomProps<T, B, PopoverChildren> {}
