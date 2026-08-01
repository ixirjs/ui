import { untrack } from 'svelte';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$ixirjs/ui/shared/capability';
import { focus, isBrowser } from '$ixirjs/ui/utils/dom.svelte';
import type { OverlayView } from '$ixirjs/ui/components/overlay';
import {
	closeOverlay,
	overlayIsDisabled,
	overlayIsOpen
} from '$ixirjs/ui/components/overlay/policies/overlay-view';
import { getPopoverPosition, popoverNode } from '$ixirjs/ui/components/popover/position-state';

const POPOVER_TAIL = sharedCapabilityKey<void>({
	owner: '@ixirjs/popover',
	name: 'tail',
	version: 1
});
const POPOVER_TAIL_GEOMETRY = sharedCapabilityKey<void>({
	owner: '@ixirjs/popover',
	name: 'tail-geometry',
	version: 1
});
const POPOVER_OVERLAY = sharedCapabilityKey<void>({
	owner: '@ixirjs/popover',
	name: 'overlay',
	version: 1
});
const POPOVER_CONTENT = sharedCapabilityKey<void>({
	owner: '@ixirjs/popover',
	name: 'content',
	version: 1
});
const POPOVER_INDICATOR = sharedCapabilityKey<void>({
	owner: '@ixirjs/popover',
	name: 'indicator',
	version: 1
});
const POPOVER_TRIGGER = sharedCapabilityKey<void>({
	owner: '@ixirjs/popover',
	name: 'trigger',
	version: 1
});

type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export interface PopoverTailPresentationOptions {
	padding?: () => number | undefined;
	/**
	 * Base thickness of the tail, in px. Drives the whole shape (cap/tip/cross).
	 * Defaults to the content's shorter side so the tail scales with the popover
	 * yet stays identical across placements.
	 */
	size?: () => number | undefined;
}

const FALLBACK_TAIL_CROSS = 28;
const FALLBACK_TAIL_CAP = 10;
const FALLBACK_TAIL_TIP = 10;
const DEFAULT_TAIL_PADDING = 0;
/** Protrusion multiplier on the derived tip length; 1 = default. */
const TAIL_TIP_DEPTH = 1.0;
/**
 * Ceiling on `cross` as a fraction of the edge it sits on. Without this, a short/narrow
 * panel (e.g. a single-line tooltip attaching on its left/right edge) gets the same fixed
 * 28px cross as a wide one — the concave taper then consumes most of that short edge, so
 * only a hairline sliver at dead-center actually reaches the trigger and the rest reads as
 * a gap with a spike, instead of a tail flush against the panel.
 */
const MAX_CROSS_EDGE_RATIO = 0.45;

export function popoverTailPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_TAIL,
		meta: {
			projects: ['tail'],
			docs: 'Popover tail presentational ARIA projection.'
		},
		attach: {
			attrs: () => ({
				role: 'presentation',
				'aria-hidden': true
			})
		}
	});
}

export function popoverTailGeometry<B extends OverlayView>(
	options: PopoverTailPresentationOptions = {}
) {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_TAIL_GEOMETRY,
		meta: {
			projects: ['tail'],
			docs: 'Popover tail side geometry and trigger-safe placement projection.'
		},
		attach: {
			attrs: (_node, bond) => {
				if (!bond) return {};
				const position = getPopoverPosition(bond);
				const placement = position?.placement ?? placementProp(bond) ?? 'top';
				const side = getPlacementSide(placement);
				const metrics = tailMetrics(bond, options, side);
				const borders = getContentBorders(bond);
				return {
					style: tailStyle(bond, options, metrics, borders),
					'data-tail-overlap': metrics.overlap,
					'data-tail-side': side,
					'data-tail-cross': metrics.cross,
					'data-tail-cap': metrics.cap,
					'data-tail-tip': metrics.tip,
					'data-tail-main': metrics.main
				};
			}
		}
	});
}

function tailStyle(
	bond: OverlayView,
	options: PopoverTailPresentationOptions,
	metrics: TailMetrics,
	borders: BorderWidths
) {
	const position = getPopoverPosition(bond);
	const placement = position?.placement ?? placementProp(bond) ?? 'top';
	const side = getPlacementSide(placement);
	const tailSize = getTailSize(side, metrics);
	// The tail's containing block is the content's padding box, but `calc(100% - cap)`
	// should overlap the content's *outer* (border-box) edge — add the border on the edge
	// the tail sits on so the base covers the border seam instead of stopping short of it.
	return [
		`${side}: calc(100% - ${metrics.overlap}px + ${tailEdgeBorder(side, borders)}px)`,
		`${crossAxisProperty(side, placement)}: ${crossAxisOffset(bond, side, placement, tailSize, options, borders)}`,
		`width: ${tailSize.width}px`,
		`height: ${tailSize.height}px`,
		'display: grid',
		'place-items: center',
		'line-height: 0',
		'overflow: visible',
		`--sa-popover-tail-transform: ${svgTransform(side)}`,
		`--sa-popover-tail-overlap: ${metrics.overlap}px`
	].join('; ');
}

function placementProp(bond: OverlayView) {
	return (bond as unknown as { props?: { placement?: string } }).props?.placement;
}

function svgTransform(side: PopoverSide) {
	return `rotate(${getRotation(side)}deg)`;
}

function getRotation(side: PopoverSide) {
	switch (side) {
		case 'top':
			return 180;
		case 'bottom':
			return 0;
		case 'left':
			return 90;
		case 'right':
			return -90;
	}
}

function getPlacementSide(value: string | undefined): PopoverSide {
	const candidate = value?.split('-')[0];
	return candidate === 'top' ||
		candidate === 'bottom' ||
		candidate === 'left' ||
		candidate === 'right'
		? candidate
		: 'top';
}

function getPlacementAlignment(value: string | undefined) {
	const candidate = value?.split('-')[1];
	return candidate === 'start' || candidate === 'end' ? candidate : undefined;
}

type TailMetrics = {
	cross: number;
	cap: number;
	tip: number;
	main: number;
	/** Distance the base tucks under the content edge — `cap`, plus any corner-sink. */
	overlap: number;
};

type BorderWidths = { top: number; right: number; bottom: number; left: number };

const ZERO_BORDERS: BorderWidths = { top: 0, right: 0, bottom: 0, left: 0 };

/** Content's computed border widths, in px. Zero on the server (no layout to read). */
function getContentBorders(bond: OverlayView): BorderWidths {
	if (!isBrowser()) return ZERO_BORDERS;
	const element = popoverNode(bond, 'content')?.element;
	if (!(element instanceof Element)) return ZERO_BORDERS;
	const style = getComputedStyle(element);
	return {
		top: parseFloat(style.borderTopWidth) || 0,
		right: parseFloat(style.borderRightWidth) || 0,
		bottom: parseFloat(style.borderBottomWidth) || 0,
		left: parseFloat(style.borderLeftWidth) || 0
	};
}

/** Border on the edge the tail sits on (opposite the placement side). */
function tailEdgeBorder(side: PopoverSide, borders: BorderWidths) {
	switch (side) {
		case 'top':
			return borders.bottom;
		case 'bottom':
			return borders.top;
		case 'left':
			return borders.right;
		case 'right':
			return borders.left;
	}
}

/** Content's computed corner radius for the two corners on `side`'s edge, in px. */
function getContentRadius(bond: OverlayView, side: PopoverSide): number {
	if (!isBrowser()) return 0;
	const element = popoverNode(bond, 'content')?.element;
	if (!(element instanceof Element)) return 0;
	const style = getComputedStyle(element);
	const topLeft = parseFloat(style.borderTopLeftRadius) || 0;
	const topRight = parseFloat(style.borderTopRightRadius) || 0;
	const bottomLeft = parseFloat(style.borderBottomLeftRadius) || 0;
	const bottomRight = parseFloat(style.borderBottomRightRadius) || 0;
	switch (side) {
		case 'top':
			return Math.min(topLeft, topRight);
		case 'bottom':
			return Math.min(bottomLeft, bottomRight);
		case 'left':
			return Math.min(topLeft, bottomLeft);
		case 'right':
			return Math.min(topRight, bottomRight);
	}
}

/**
 * When the content's rounded corner eats into the flat edge the tail's flat base sits
 * on (a short/pill-shaped panel), the base can't fully rest on a straight run — grow the
 * base band by this much so it recedes into the curve, keeping the pointed tip's shape
 * and visible length unchanged.
 */
function cornerSink(radius: number, edge: number, cross: number, cap: number) {
	if (radius <= 0) return 0;
	if (edge - 2 * radius >= cross) return 0; // flat run already fits the tail
	const clampedRadius = Math.min(radius, edge / 2);
	const half = Math.min(cross / 2, clampedRadius);
	const recession =
		clampedRadius - Math.sqrt(Math.max(0, clampedRadius * clampedRadius - half * half));
	return round(Math.min(recession, cap));
}

function tailMetrics(
	bond: OverlayView,
	options: PopoverTailPresentationOptions,
	side: PopoverSide
): TailMetrics {
	// Drive the shape off the content's shorter side (or an explicit `size`), never the
	// placement axis. This keeps the tail identical top/bottom/left/right and guarantees it
	// fits the edge it sits on — a wide panel no longer yields a giant left/right tail.
	const rect = getFloatingRect(bond);
	const thickness =
		options.size?.() ?? (rect ? Math.min(rect.width, rect.height) : FALLBACK_TAIL_CAP * 2);
	const cap = round(Math.max(1, thickness / 2));
	const tip = round(
		TAIL_TIP_DEPTH * Math.max(FALLBACK_TAIL_TIP * 0.8, Math.min(FALLBACK_TAIL_TIP * 1.4, cap / 2))
	);

	const isX = side === 'left' || side === 'right';
	const edge = rect ? (isX ? rect.height : rect.width) : 0;
	const crossCeiling = rect ? Math.max(cap, edge * MAX_CROSS_EDGE_RATIO) : Infinity;
	const cross = round(Math.min(Math.max(FALLBACK_TAIL_CROSS, cap), crossCeiling));

	const radius = getContentRadius(bond, side);
	const sink = rect ? cornerSink(radius, edge, cross, cap) : 0;

	// Corner-sink grows the flat *base* band (cap) so it can tuck deeper into the curve —
	// it must NOT grow `tip`, which is the pointed/tapered region. Feeding sink into `tip`
	// instead pushes the hidden overlap up past the apex, so only a flat cross-section of
	// the flank shows through — never the actual point.
	const sunkCap = round(cap + sink);

	return {
		cross,
		cap: sunkCap,
		tip,
		main: round(sunkCap + tip),
		overlap: sunkCap
	};
}

function getTailSize(value: PopoverSide, metrics: TailMetrics) {
	return value === 'left' || value === 'right'
		? { width: metrics.main, height: metrics.cross }
		: { width: metrics.cross, height: metrics.main };
}

type Axis = 'x' | 'y';
type AxisSpan = { start: number; end: number };

function crossAxisOf(side: PopoverSide): Axis {
	return side === 'top' || side === 'bottom' ? 'x' : 'y';
}

/**
 * `-end` placements anchor the tail from the trailing edge (`right`/`bottom`)
 * so it stays glued to that edge when the floating element resizes; everything
 * else anchors from the leading edge (`left`/`top`).
 */
function crossAxisProperty(side: PopoverSide, placement: string) {
	const fromEnd = getPlacementAlignment(placement) === 'end';
	if (crossAxisOf(side) === 'x') return fromEnd ? 'right' : 'left';
	return fromEnd ? 'bottom' : 'top';
}

function axisSpan(rect: DOMRect, axis: Axis): AxisSpan {
	return axis === 'x'
		? { start: rect.left, end: rect.right }
		: { start: rect.top, end: rect.bottom };
}

/**
 * CSS offset that centers the tail on the trigger along the cross axis,
 * clamped so the tail's center never leaves the floating element
 * (inset by `options.padding`). Measured from the same edge as
 * `crossAxisProperty`: trailing edge for `-end` placements, leading otherwise.
 */
function crossAxisOffset(
	bond: OverlayView,
	side: PopoverSide,
	placement: string,
	tailSize: { width: number; height: number },
	options: PopoverTailPresentationOptions,
	borders: BorderWidths
) {
	const axis = crossAxisOf(side);
	const size = axis === 'x' ? tailSize.width : tailSize.height;
	const fromEnd = getPlacementAlignment(placement) === 'end';

	const referenceRect = getReferenceRect(bond);
	const floatingRect = getElementRect(bond, 'content') ?? getElementRect(bond, 'overlay');
	if (!referenceRect || !floatingRect) return middlewareTailOffset(bond, axis, size, fromEnd);

	const reference = axisSpan(referenceRect, axis);
	const floating = axisSpan(floatingRect, axis);

	const alignment = getPlacementAlignment(placement);
	const padding = options.padding?.() ?? DEFAULT_TAIL_PADDING;
	const span = floating.end - floating.start;
	const cornerRadius = getContentRadius(bond, side);
	// Keep the tail's flat base clear of the rounded corners when the edge has room for
	// it; when it doesn't (a small pill-shaped panel), fall back to best-effort centering
	// — `cornerSink` (in tailMetrics) then grows the base band so it recedes into the
	// curve instead of poking out over it, leaving the visible tip unchanged.
	// `inset` bounds the tail's *center*, so clearing the corner by `cornerRadius` needs
	// an extra `size / 2` — otherwise only the center clears the curve while the near
	// edge (center - size/2) still overlaps it, cutting a diagonal notch across the tail.
	const halfSize = size / 2;
	const safeInset =
		cornerRadius <= 0
			? 0
			: span - 2 * cornerRadius >= size
				? cornerRadius + halfSize
				: Math.max(0, (span - size) / 2);
	const inset = clamp(Math.max(padding, safeInset), 0, Math.max(0, span / 2));
	// No alignment → sit at the content edge's midpoint. In the common case the content is
	// centered on the trigger, so this also points at the trigger's center; when `shift`
	// displaces the content off the trigger's midline the tail stays centered on the content
	// rather than drifting to one edge. `-start`/`-end` track the trigger's leading/trailing
	// edge, clamped inside the content.
	const tailCenter =
		alignment === undefined
			? (floating.start + floating.end) / 2
			: clamp(
					triggerTailCenter(reference, placement, size),
					floating.start + inset,
					floating.end - inset
				);

	// The offset is applied inside the content's padding box, but `floating` is its border-box
	// (getBoundingClientRect). Subtract the border on the anchored edge so the tail lands on the
	// trigger's midpoint instead of drifting outward by the border width.
	const crossBorder = crossAxisBorder(axis, fromEnd, borders);

	// Viewport coordinate → offset of the tail's nearest edge inside the floating element.
	return fromEnd
		? `${round(floating.end - tailCenter - size / 2 - crossBorder)}px`
		: `${round(tailCenter - floating.start - size / 2 - crossBorder)}px`;
}

/** Border on the edge the cross-axis offset is measured from. */
function crossAxisBorder(axis: Axis, fromEnd: boolean, borders: BorderWidths) {
	if (axis === 'x') return fromEnd ? borders.right : borders.left;
	return fromEnd ? borders.bottom : borders.top;
}

/** Fallback when trigger/content rects are unavailable (e.g. before first measure). */
function middlewareTailOffset(bond: OverlayView, axis: Axis, size: number, fromEnd: boolean) {
	// `middlewareData.arrow` is floating-ui's own `arrow()` middleware output — not our naming.
	const tailData = getPopoverPosition(bond)?.middlewareData?.arrow;
	const offset = axis === 'x' ? tailData?.x : tailData?.y;
	if (typeof offset !== 'number') return `calc(50% - ${size / 2}px)`;
	// Middleware offsets are measured from the leading edge; mirror for trailing anchors.
	return fromEnd ? `calc(100% - ${round(offset + size)}px)` : `${round(offset)}px`;
}

function triggerTailCenter(reference: AxisSpan, placement: string, tailSize: number) {
	const alignment = getPlacementAlignment(placement);
	const halfTail = tailSize / 2;
	if (alignment === 'start') return reference.start + halfTail;
	if (alignment === 'end') return reference.end - halfTail;
	return (reference.start + reference.end) / 2;
}

function getReferenceRect(bond: OverlayView) {
	const reference =
		popoverNode(bond, 'virtual-trigger')?.element ?? popoverNode(bond, 'trigger')?.element;
	return getRect(reference);
}

function getFloatingRect(bond: OverlayView) {
	return getRect(popoverNode(bond, 'content')?.element);
}

function getElementRect(bond: OverlayView, key: string) {
	return getRect(popoverNode(bond, key)?.element);
}

function getRect(value: unknown) {
	if (!value || typeof value !== 'object' || !('getBoundingClientRect' in value)) return undefined;
	const getBoundingClientRect = value.getBoundingClientRect;
	return typeof getBoundingClientRect === 'function'
		? (getBoundingClientRect.call(value) as DOMRect)
		: undefined;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function round(value: number) {
	return Math.round(value * 100) / 100;
}

export function popoverOverlayPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B, HTMLElement>({
		slot: POPOVER_OVERLAY,
		meta: {
			projects: ['overlay'],
			docs: 'Popover overlay dialog ARIA, active-state projection, and open-focus behavior.'
		},
		attach: {
			attrs: (_node, bond) => {
				if (!bond) return {};
				// Resolved through the node registry, not rebuilt from the id convention: a consumer
				// id on the trigger wins on that element, which left this pointing at nothing.
				const triggerId = bond.nodeByPart('trigger')?.id;
				const isOpen = overlayIsOpen(bond);
				const isDisabled = overlayIsDisabled(bond);
				const isActive = isOpen && !isDisabled;

				return {
					role: 'dialog',
					'aria-modal': false,
					...(triggerId ? { 'aria-labelledby': triggerId } : {}),
					inert: !isActive ? true : undefined,
					tabindex: -1,
					'data-active': isActive,
					'data-state': isOpen ? 'open' : 'closed'
				};
			},
			onmount: (element, _node, bond) => {
				if (!bond) return;
				const triggerElement = popoverNode(bond, 'trigger')?.element as Element | undefined;
				if (!triggerElement) return;

				const isOpen = untrack(() => overlayIsOpen(bond));
				if (!isOpen) return;

				const activeElement = document.activeElement as HTMLElement;
				const triggerContainsFocus =
					['input', 'textarea'].includes(activeElement.tagName.toLowerCase()) &&
					triggerElement.contains(activeElement);

				if (!triggerContainsFocus) {
					setTimeout(
						() => focus(element, ['textarea:not([disabled])', 'input:not([disabled])']),
						0
					);
				}
			}
		}
	});
}

export function popoverContentPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_CONTENT,
		meta: {
			projects: ['content'],
			docs: 'Popover content active-state projection.'
		},
		attach: {
			attrs: (_node, bond) => {
				if (!bond) return {};
				const isOpen = overlayIsOpen(bond);
				const isDisabled = overlayIsDisabled(bond);
				return {
					'data-active': isOpen && !isDisabled,
					'data-state': isOpen ? 'open' : 'closed'
				};
			}
		}
	});
}

export function popoverIndicatorPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_INDICATOR,
		meta: {
			projects: ['indicator'],
			docs: 'Popover indicator live-state projection.'
		},
		attach: {
			attrs: (_node, bond) => {
				const isOpen = bond ? overlayIsOpen(bond) : false;
				return {
					'aria-hidden': true,
					'aria-live': isOpen ? ('polite' as const) : ('off' as const)
				};
			}
		}
	});
}

export function popoverTriggerPresentation<B extends OverlayView>() {
	return defineAtomCapability<void, AtomHost, B>({
		slot: POPOVER_TRIGGER,
		meta: {
			projects: ['trigger'],
			docs: 'Popover trigger button semantics and keyboard routing.'
		},
		attach: {
			attrs: (node, bond) => {
				const isButtonElement = isBrowser() ? node.element instanceof HTMLButtonElement : false;
				const isDisabled = bond ? overlayIsDisabled(bond) : false;
				return {
					role: isButtonElement ? '' : 'button',
					disabled: isButtonElement ? isDisabled : undefined
				};
			},
			handlers: (_node, bond) => ({
				onkeydown: (ev: KeyboardEvent) => {
					if (!bond || overlayIsDisabled(bond)) return;

					if (ev.key === 'Tab') {
						(popoverNode(bond, 'content')?.element as HTMLElement | undefined)?.focus();
						return;
					}

					if (ev.key === 'Escape') {
						closeOverlay(bond);
					}
				}
			})
		}
	});
}
