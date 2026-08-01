export function getElementId(id: string, kind: string) {
	return `${kind}-${id}`;
}

export function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/** True when `el` is a real DOM Element and `target` is `el` itself or a descendant.
 *  `el` is typed `unknown` so it accepts Element | VirtualElement | null | undefined
 *  without a cast at the call site; the `instanceof` narrow keeps `.contains` safe.
 *  (Note: `Node.contains(node)` is true for the node itself, so no separate `=== target` check is needed.) */
export function containsTarget(el: unknown, target: EventTarget | null): boolean {
	return el instanceof Element && el.contains(target as Node | null);
}

/** Synchronous, non-reactive read of the prefers-reduced-motion media query.
 *  For a reactive version use the `reducedMotion()` rune. SSR-safe (returns false). */
export function prefersReducedMotion(): boolean {
	if (!isBrowser()) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Single source of truth for what counts as a tabbable element. */
export const FOCUSABLE_SELECTORS = [
	'a[href]',
	'button:not([disabled])',
	'textarea:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
];

export function focusTrap(ev: KeyboardEvent) {
	const node = ev.currentTarget as HTMLElement;

	// cycle Tab/Shift+Tab within the container
	if (ev.key === 'Tab') {
		const focusableElements = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS.join(', '));
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (ev.shiftKey && document.activeElement === firstElement) {
			ev.preventDefault();
			lastElement?.focus();
		} else if (!ev.shiftKey && document.activeElement === lastElement) {
			ev.preventDefault();
			firstElement?.focus();
		}
	}
}

export function focus(element: Element | null, elementsSelectors: string[] = FOCUSABLE_SELECTORS) {
	const firstFocusable = element?.querySelector<HTMLElement>(elementsSelectors.join(', '));

	((firstFocusable || element) as HTMLElement)?.focus({ preventScroll: true });
}
