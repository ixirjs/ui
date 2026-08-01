import type { Bond } from '$ixirjs/ui/shared/bond';
import { containsTarget, isBrowser } from '$ixirjs/ui/utils/dom.svelte';
import type { GeometryRect } from '$ixirjs/ui/shared/capability/models/geometry.svelte';

export type EffectGuard = boolean | ((bond: Bond) => boolean);
export type ElementSource =
	| Element
	| null
	| undefined
	| readonly (Element | null | undefined)[]
	| ((bond: Bond) => Element | null | undefined | readonly (Element | null | undefined)[]);
export type DocumentSource = Document | (() => Document | undefined);
export type WindowSource = Window | (() => Window | undefined);

export function resolveElements(source: ElementSource | undefined, bond: Bond): Element[] {
	const value = typeof source === 'function' ? source(bond) : source;
	const items = Array.isArray(value) ? value : [value];
	return items.filter(
		(item): item is Element => typeof Element !== 'undefined' && item instanceof Element
	);
}

export function firstElement(source: ElementSource | undefined, bond: Bond): Element | undefined {
	return resolveElements(source, bond)[0];
}

export function isInsideSource(
	source: ElementSource | undefined,
	bond: Bond,
	target: EventTarget | null
): boolean {
	return resolveElements(source, bond).some((element) => containsTarget(element, target));
}

export function resolveDocument(source: DocumentSource | undefined): Document | undefined {
	if (source) return typeof source === 'function' ? source() : source;
	return isBrowser() ? document : undefined;
}

export function resolveWindow(source: WindowSource | undefined): Window | undefined {
	if (source) return typeof source === 'function' ? source() : source;
	return isBrowser() ? window : undefined;
}

export function isEnabled(enabled: EffectGuard | undefined, bond: Bond): boolean {
	if (typeof enabled === 'function') return enabled(bond);
	return enabled !== false;
}

const observerIds = new WeakMap<Element, string>();
let observerId = 0;

export function observerKey(
	element: Element,
	bond: Bond | undefined,
	key: string | ((element: Element, bond: Bond) => string) | undefined
): string {
	if (typeof key === 'string') return key;
	if (typeof key === 'function' && bond) return key(element, bond);
	// `data-kind` identifies a slot family, not an element. Anonymous repeated atoms therefore
	// need an element-local fallback rather than overwriting each other's geometry.
	if (element.id) return element.id;
	let id = observerIds.get(element);
	if (!id) {
		id = `observer:${++observerId}`;
		observerIds.set(element, id);
	}
	return id;
}

export function domRectToGeometry(rect: DOMRectReadOnly): GeometryRect {
	return {
		x: rect.x,
		y: rect.y,
		width: rect.width,
		height: rect.height,
		top: rect.top,
		right: rect.right,
		bottom: rect.bottom,
		left: rect.left
	};
}

export function listen(
	target: EventTarget,
	type: string,
	handler: EventListener,
	options?: AddEventListenerOptions
): () => void {
	target.addEventListener(type, handler, options);
	return () => target.removeEventListener(type, handler, options);
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function isWindow(value: unknown): value is Window {
	return typeof Window !== 'undefined' && value instanceof Window;
}

export function isElement(value: unknown): value is Element {
	return typeof Element !== 'undefined' && value instanceof Element;
}

export function isNode(value: unknown): value is Node {
	return typeof Node !== 'undefined' && value instanceof Node;
}

export function noop(): void {}
