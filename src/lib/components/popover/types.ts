import type { Component, Snippet } from 'svelte';
import type { Placement } from '@floating-ui/dom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { PopoverBond } from './bond.svelte';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { BondPresetLayers } from '$ixirjs/ui/authoring';
import type { Base, HtmlElementTagName, RenderProps } from '$ixirjs/ui/authoring';
import type {
	LayerInput,
	LayerRelation,
	PortalBond,
	TeleportProps,
	ZIndexInput
} from '$ixirjs/ui/components/portal';

export type PopoverChildren = Snippet<[{ popover: PopoverBond }]>;

/** Per-instance presentation layers for Popover's bonded parts. */
export interface PopoverPresets extends BondPresetLayers {
	trigger?: PresetLike;
	content?: PresetLike;
	indicator?: PresetLike;
	tail?: PresetLike;
	overlay?: PresetLike;
	'virtual-trigger'?: PresetLike;
}

export interface PopoverRootProps {
	/**
	 * Bindable open state for the menu.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Prevents the context-menu trigger from opening the menu.
	 * @default false
	 */
	disabled?: boolean;
	/** Ordered fallback placements used when the preferred placement does not fit. */
	placements?: Placement[];
	/** Preferred Floating UI placement for the menu. */
	placement?: Placement;
	/** Distance in pixels between the virtual cursor anchor and content. */
	offset?: number;
	/** CSS positioning strategy for the floating content. Defaults to `'absolute'`. */
	position?: 'fixed' | 'absolute';
	/**
	 * Portal target selector or PortalBond instance. Resolution is explicit target → ambient portal → root.l0, preserving nested overlay containment.
	 * @default ambient portal → root.l0
	 */
	portal?: string | PortalBond;
	/** Per-instance presentation overrides for bonded Popover parts. */
	presets?: PopoverPresets | undefined;
	/** Extend */
	extend?: Record<string, unknown>;
	/** Factory */
	factory?: Factory<PopoverBond>;
	/** Called after a real open-state transition commits; dismissal events and reasons are included when available. */
	onopenchange?: StateChangeCallback<boolean, PopoverBond> | undefined;
	/** Children */
	children?: PopoverChildren;
}

export interface PopoverOverlayProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends TeleportProps<E, B, PopoverChildren> {
	/** Portal surface to render the overlay into, by id or Bond. */
	portal?: string | PortalBond | undefined;
	/** Semantic z-index layer for the floating content. Defaults to `'popover'`. */
	layer?: LayerInput | undefined;
	/**
	 * Order the content relative to a registered ZLayer anchor — `below` a
	 * sticky header registered via `ZLayer.anchor(...)` puts the popover beneath it.
	 */
	order?: LayerRelation | undefined;
	/** Explicit z-index for the overlay. Prefer the semantic layer unless resolving a stacking conflict. */
	'z-index'?: ZIndexInput | undefined;
	/** Content of this part. */
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
> extends RenderProps<T, B, PopoverChildren> {
	/** Replaces the overlay component the content renders into. */
	overlay?: Component<PopoverOverlayProps>;
	/** Semantic z-index layer for the floating content. Defaults to `'popover'`. */
	layer?: LayerInput | undefined;
	/** Order the content relative to a registered ZLayer anchor (sticky-under). */
	order?: LayerRelation | undefined;
	/** Explicit z-index for the floating content, forwarded to the {@link Overlay}. */
	'z-index'?: ZIndexInput | undefined;
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
	/** Called for an outside press; providing it replaces the default close handler. */
	onclickoutside?: (ev: PointerEvent, atom: PopoverBond) => void;
}

export interface PopoverIndicatorProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, PopoverChildren> {}

export interface PopoverTailProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, PopoverChildren> {
	/** Minimum distance, in px, between the tail wrapper and the content edge. Defaults to `0`. */
	padding?: number | undefined;
	/**
	 * Base thickness of the tail, in px. Drives the whole shape and stays consistent across
	 * placements. Defaults to the content's shorter side.
	 */
	size?: number | undefined;
}

// The native handlers (`onclick`, `onkeydown`, `onpointerenter`, …) come from `RenderProps`; a
// consumer's runs before the part's own, which is skipped when the default is prevented.
export interface PopoverTriggerProps<
	T extends HtmlElementTagName,
	B extends Base = Base
> extends RenderProps<T, B, PopoverChildren> {}
