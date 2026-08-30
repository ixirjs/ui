/**
 * Overlay behaviour as functions over `OverlayBond` — what the capability policies projected onto
 * roles, written literally by each part into its own `attrs`.
 *
 * Attribute helpers return the object a part spreads; `use*` helpers create effects and must be
 * called during a component's init; handler helpers return the handler a part composes with the
 * consumer's via `Kernel.compose`.
 */
import { on } from 'svelte/events';
import { containsTarget, focus, focusTrap, isBrowser } from '$ixirjs/ui/utils/dom.svelte';
import { acquireBodyLock, acquireInert, siblingsOf } from '$ixirjs/ui/utils/document-lock';
import { isTopOverlay, useEscapeStack } from './escape-stack.svelte';
import type { OverlayBond, OverlayKnobs, OverlayPart } from './model.svelte';

export {
	enrollOverlay,
	isTopOverlay,
	resetEscapeStackForTest,
	useEscapeStack
} from './escape-stack.svelte';

type Overlay = OverlayBond;

// ---------------------------------------------------------------------------------------------
// Trigger

/** ARIA the trigger of any overlay carries. `aria-controls` only while the content is rendered. */
export function triggerAttrs(o: Overlay, ariaHasPopup: OverlayKnobs['ariaHasPopup'] = 'dialog') {
	const contentId = o.partId('content');
	const isDisabled = o.isDisabled;
	return {
		'aria-expanded': o.isOpen,
		'aria-disabled': isDisabled,
		'aria-haspopup': ariaHasPopup,
		...(contentId ? { 'aria-controls': contentId } : {}),
		tabindex: isDisabled ? -1 : 0
	};
}

/** Click + Enter/Space toggle; the change reports `reason: 'trigger'`. */
export function clickTrigger(o: Overlay) {
	return {
		onclick: (event: MouseEvent) => {
			if (event.button === 2 || event.defaultPrevented) return;
			o.stageOpenChange({ event, reason: 'trigger' });
			o.toggle();
		},
		onkeydown: (event: KeyboardEvent) => {
			if (event.key !== 'Enter' && event.key !== ' ') return;
			event.preventDefault();
			o.stageOpenChange({ event, reason: 'trigger' });
			o.toggle();
		}
	};
}

export type HoverTriggerOptions = {
	/** Delay before opening on pointer-enter, ms. Default 200. */
	openDelay?: number;
	/** Delay before closing on pointer-leave, ms. Default 150. */
	closeDelay?: number;
};

/** Open on pointer-enter/focusin (with delay), close on pointer-leave/focusout. Init-time: owns its timers. */
export function hoverTrigger(o: Overlay, opts: HoverTriggerOptions = {}) {
	const { openDelay = 200, closeDelay = 150 } = opts;
	let openT: ReturnType<typeof setTimeout> | undefined;
	let closeT: ReturnType<typeof setTimeout> | undefined;
	const clear = () => {
		clearTimeout(openT);
		clearTimeout(closeT);
		openT = closeT = undefined;
	};
	$effect(() => clear);
	return {
		onpointerenter: () => {
			clear();
			openT = setTimeout(() => o.open(), openDelay);
		},
		onpointerleave: () => {
			clear();
			closeT = setTimeout(() => o.close(), closeDelay);
		},
		onfocusin: () => {
			clear();
			o.open();
		},
		onfocusout: () => {
			clear();
			o.close();
		}
	};
}

/** Opens on right-click. */
export function contextMenuTrigger(o: Overlay) {
	return {
		oncontextmenu: (event: MouseEvent) => {
			event.preventDefault();
			o.stageOpenChange({ event, reason: 'trigger' });
			o.open();
		}
	};
}

// ---------------------------------------------------------------------------------------------
// Escape

export type EscapeHandler = (o: Overlay, event: KeyboardEvent) => void;

export const closeOnEscape: EscapeHandler = (o, event) => {
	o.stageOpenChange({ event, reason: 'escape' });
	o.close();
};

/** Escape is still prevented but the overlay stays open. */
export const ignoreEscape: EscapeHandler = () => {};

/**
 * The surface's Escape handler. Under portal containment overlays DOM-nest, so one Escape bubbles
 * through both surfaces; only the topmost enrolled overlay acts and an enclosing one lets the
 * event pass, so nothing double-closes.
 */
export function escapeKeydown(o: Overlay, onEscape: EscapeHandler = closeOnEscape) {
	return (event: KeyboardEvent) => {
		if (event.key !== 'Escape') return;
		if (!isTopOverlay(o) || o.isDisabled) return;
		event.preventDefault();
		onEscape(o, event);
	};
}

// ---------------------------------------------------------------------------------------------
// Dismissal by press

export type DismissPressEvent = MouseEvent | PointerEvent;

export type DismissOptions = {
	enabled?: boolean;
	/** Respect the overlay stack (only the top overlay dismisses). Default true. */
	stack?: boolean;
	/** Parts a press inside of does not dismiss. */
	inside?: readonly OverlayPart[];
	onDismiss?: (event: DismissPressEvent, o: Overlay) => void;
};

export type OutsidePressOptions = DismissOptions & {
	event?: 'click' | 'pointerdown' | 'mousedown';
};

/** A press outside `content` and `trigger` closes the overlay (`reason: 'outside-press'`). */
export function outsidePress(o: Overlay, event: DismissPressEvent, options: DismissOptions = {}) {
	if (isInside(o, event.target, options.inside ?? ['content', 'trigger'])) return;
	dismiss(o, event, 'outside-press', options);
}

/** A press on the backdrop, outside `content`, closes the overlay (`reason: 'backdrop-press'`). */
export function backdropPress(o: Overlay, event: DismissPressEvent, options: DismissOptions = {}) {
	if (isInside(o, event.target, options.inside ?? ['content'])) return;
	dismiss(o, event, 'backdrop-press', options);
}

/** Listen on the window while open and dismiss on an outside press. Init-time. */
export function useOutsidePress(o: Overlay, options: OutsidePressOptions = {}): void {
	$effect(() => {
		if (!isBrowser() || options.enabled === false || !o.isOpen) return;
		return on(
			window,
			options.event ?? 'pointerdown',
			(event) => outsidePress(o, event as DismissPressEvent, options),
			{ capture: true }
		);
	});
}

function dismiss(
	o: Overlay,
	event: DismissPressEvent,
	reason: string,
	options: DismissOptions
): void {
	if (options.enabled === false || event.defaultPrevented) return;
	if ('button' in event && event.button === 2) return;
	if (options.stack !== false && !isTopOverlay(o)) return;
	if (!o.isOpen || o.isDisabled) return;
	options.onDismiss?.(event, o);
	if (event.defaultPrevented) return;
	o.stageOpenChange({ event, reason });
	o.close();
}

function isInside(o: Overlay, target: EventTarget | null, parts: readonly OverlayPart[]): boolean {
	for (const part of parts) if (containsTarget(o.element(part), target)) return true;
	return false;
}

// ---------------------------------------------------------------------------------------------
// Focus

export type FocusOptions = Pick<OverlayKnobs, 'restoreFocus' | 'captureFocusOnOpen'>;

/** Snapshot `activeElement` on closed→open, restore it on open→closed. Init-time. */
export function useFocusRestore(o: Overlay, options: FocusOptions = {}): void {
	let previous: HTMLElement | null = null;
	let wasOpen = false;

	// Before the DOM updates for the open, ahead of the focus-on-open microtask.
	$effect.pre(() => {
		if (!o.isOpen || options.captureFocusOnOpen === false || !isBrowser()) return;
		previous = document.activeElement as HTMLElement | null;
	});

	// Open→closed edge only; `wasOpen` keeps the initial mount from stealing focus.
	$effect(() => {
		const open = o.isOpen;
		if (!open && wasOpen) restoreFocusTo(o, options.restoreFocus ?? 'trigger', previous);
		wasOpen = open;
	});
}

function restoreFocusTo(
	o: Overlay,
	target: NonNullable<OverlayKnobs['restoreFocus']>,
	previous: HTMLElement | null
): void {
	if (target === 'none') return;
	let el: HTMLElement | null | undefined;
	if (target === 'trigger') el = o.element('trigger');
	else if (target === 'previous') el = previous;
	else el = target();
	el?.focus?.();
}

/** Focus the first focusable inside the content on the closed→open edge, once it exists. Init-time. */
export function useFocusOnOpen(o: Overlay): void {
	let wasOpen = o.isOpen;
	$effect(() => {
		const isOpen = o.isOpen;
		if (isOpen && !wasOpen) {
			const content = o.element('content');
			if (content) focusContentOnMount(o, content);
		}
		wasOpen = isOpen;
	});
}

/** The content part calls this from its mount: focus it when the overlay is already open. */
export function focusContentOnMount(o: Overlay, node: HTMLElement): void {
	if (!o.isOpen) return;
	queueMicrotask(() => {
		if (o.isOpen) focus(node);
	});
}

/** Cycle Tab within the surface while modal. */
export function focusTrapKeydown(o: Overlay) {
	return (event: KeyboardEvent) => {
		if (o.modal) focusTrap(event);
	};
}

/** The modal surface's keydown: Escape policy plus the Tab trap. */
export function surfaceKeydown(o: Overlay, onEscape: EscapeHandler = closeOnEscape) {
	const escape = escapeKeydown(o, onEscape);
	const trap = focusTrapKeydown(o);
	return (event: KeyboardEvent) => {
		escape(event);
		trap(event);
	};
}

// ---------------------------------------------------------------------------------------------
// Document effects

/** Lock body scroll while `enabled()`. Init-time. */
export function useBodyScrollLock(
	enabled: () => boolean,
	options: { target?: () => HTMLElement | undefined; paddingCompensation?: boolean } = {}
): void {
	$effect(() => {
		if (!isBrowser() || !enabled()) return;
		const target = options.target?.() ?? document.body;
		return acquireBodyLock(target, document, options.paddingCompensation ?? false);
	});
}

/** Mark the siblings of `target()` (under `root()`, its parent by default) inert while `enabled()`. Init-time. */
export function useInertSiblings(
	enabled: () => boolean,
	target: () => Element | null | undefined,
	root?: () => Element | null | undefined
): void {
	$effect(() => {
		if (!isBrowser() || !enabled()) return;
		const element = target();
		if (!element) return;
		const siblings = siblingsOf(element, root?.());
		if (siblings.length === 0) return;
		const release = siblings.map((sibling) => acquireInert(sibling, true));
		return () => {
			for (const undo of release.reverse()) undo();
		};
	});
}

/** Modal ARIA/inert/open-state projection for a dialog-like root. */
export function modalRootAttrs(o: Overlay) {
	const titleId = o.partId('title');
	const descriptionId = o.partId('description');
	const isOpen = o.isOpen;
	const modal = o.modal;
	const isActive = isOpen && !o.isDisabled;
	return {
		role: 'dialog',
		'aria-modal': modal ? true : undefined,
		'aria-labelledby': titleId,
		'aria-describedby': descriptionId,
		inert: modal && !isActive ? true : undefined,
		tabindex: -1,
		'data-open': isOpen,
		'data-state': isOpen ? 'open' : 'closed'
	};
}

/** True while a modal overlay is open and enabled. */
export function modalIsActive(o: Overlay): boolean {
	return o.modal && o.isOpen && !o.isDisabled;
}

/** Open/active state every overlay content carries. */
export function contentStateAttrs(o: Overlay) {
	const isOpen = o.isOpen;
	return {
		'data-active': isOpen && !o.isDisabled,
		'data-state': isOpen ? 'open' : 'closed'
	};
}

/** Everything a modal overlay root does besides its own element: focus, escape stack, document effects. Init-time. */
export function useModal(
	o: Overlay,
	options: FocusOptions & { root?: () => HTMLElement | null | undefined } = {}
): void {
	useFocusRestore(o, { restoreFocus: 'previous', captureFocusOnOpen: true, ...options });
	useFocusOnOpen(o);
	useEscapeStack(o);
	useBodyScrollLock(() => modalIsActive(o));
	useInertSiblings(
		() => modalIsActive(o),
		() => options.root?.() ?? o.element('root'),
		() => (options.root?.() ?? o.element('root'))?.parentElement
	);
}

/** Everything a positioned overlay root does besides its element: focus-on-open, restore to trigger, stack. Init-time. */
export function usePositioned(o: Overlay, options: FocusOptions = {}): void {
	useFocusRestore(o, { restoreFocus: 'trigger', captureFocusOnOpen: false, ...options });
	useFocusOnOpen(o);
	useEscapeStack(o);
}
