import { untrack } from 'svelte';
import {
	defineCapability,
	sharedCapabilityKey,
	type Capability,
	type CapabilityKey
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import { isBrowser } from '$ixirjs/ui/utils/dom.svelte';
import {
	GEOMETRY,
	type GeometryModel,
	type GeometryRect
} from '$ixirjs/ui/shared/capability/models/geometry.svelte';
import {
	domRectToGeometry,
	noop,
	observerKey
} from '$ixirjs/ui/shared/capability/models/bond-effects/shared';

// `observed`/`records` are published reactively but mutated inside a mount or attachment effect, so
// reads in a write expression are untracked — otherwise the effect depends on the state it assigns
// and re-runs to the depth limit. Same fix as `Collection.set`; unexercised until the virtual family
// became the first in-repo consumer.
export const RESIZE_OBSERVER = sharedCapabilityKey<ResizeObserverSurface>(
	'@ixirjs/cap:resize-observer'
);
export const INTERSECTION_OBSERVER = sharedCapabilityKey<IntersectionObserverSurface>(
	'@ixirjs/cap:intersection-observer'
);
export const MUTATION_OBSERVER = sharedCapabilityKey<MutationObserverSurface>(
	'@ixirjs/cap:mutation-observer'
);

export interface ObserverProjectionOptions {
	roles?: readonly string[];
	key?: string | ((element: Element, bond: Bond) => string);
}

export interface ResizeObserverCapabilityOptions extends ObserverProjectionOptions {
	box?: ResizeObserverBoxOptions;
	onResize?: (entry: ResizeObserverEntry, bond: Bond) => void;
}

export interface ResizeObserverSurface {
	observe(element: Element, key?: string): () => void;
	entry(element: Element): ResizeObserverEntry | undefined;
	rect(key: string): GeometryRect | undefined;
	readonly observed: readonly Element[];
}

export function resizeObserverCapability(
	options: ResizeObserverCapabilityOptions = {}
): Capability<ResizeObserverSurface> {
	let bondRef: Bond | undefined;
	let observer: ResizeObserver | undefined;
	// Resolved once at setup: the geometry sink is optional and `bond.surface` DEV-warns on an empty
	// slot, so probing per resize turned an ordinary "no geometry here" into one console line per
	// frame per element. `bond.capabilities` answers the same question quietly.
	let geometry: GeometryModel | undefined;
	let observed = $state<Element[]>([]);
	const entries = new Map<Element, ResizeObserverEntry>();
	const rects = new Map<string, GeometryRect>();
	const keys = new Map<Element, string>();
	const keyCounts = new Map<string, number>();
	const counts = new Map<Element, number>();
	const surface: ResizeObserverSurface = {
		observe(element, key) {
			if (!isBrowser() || typeof ResizeObserver === 'undefined') return noop;
			observer ??= new ResizeObserver((nextEntries) => {
				for (const entry of nextEntries) {
					entries.set(entry.target, entry);
					const currentKey = keys.get(entry.target);
					if (currentKey) {
						const rect = domRectToGeometry(entry.contentRect);
						rects.set(currentKey, rect);
						geometry?.setRect(currentKey, rect);
					}
					if (bondRef) options.onResize?.(entry, bondRef);
				}
			});
			const count = counts.get(element) ?? 0;
			if (count === 0) {
				const geometryKey = key ?? observerKey(element, bondRef, options.key);
				keys.set(element, geometryKey);
				keyCounts.set(geometryKey, (keyCounts.get(geometryKey) ?? 0) + 1);
				observed = [...untrack(() => observed), element];
				observer.observe(element, options.box ? { box: options.box } : undefined);
			}
			counts.set(element, count + 1);
			let released = false;
			return () => {
				if (released) return;
				released = true;
				const remaining = (counts.get(element) ?? 1) - 1;
				if (remaining > 0) {
					counts.set(element, remaining);
					return;
				}
				counts.delete(element);
				observer?.unobserve(element);
				entries.delete(element);
				const currentKey = keys.get(element);
				if (currentKey) {
					const remainingForKey = (keyCounts.get(currentKey) ?? 1) - 1;
					if (remainingForKey > 0) {
						keyCounts.set(currentKey, remainingForKey);
					} else {
						keyCounts.delete(currentKey);
						rects.delete(currentKey);
						geometry?.clear(currentKey);
					}
				}
				keys.delete(element);
				observed = untrack(() => observed).filter((item) => item !== element);
			};
		},
		entry(element) {
			return entries.get(element);
		},
		rect(key) {
			return rects.get(key);
		},
		get observed() {
			return observed;
		}
	};

	return defineObserverEffect(RESIZE_OBSERVER, surface, options, {
		docs: 'Observes element size and updates the geometry surface when available.',
		setup(bond) {
			bondRef = bond;
			geometry = bond.capabilities.some((capability) => capability.slot === GEOMETRY)
				? bond.surface(GEOMETRY)
				: undefined;
			return () => {
				observer?.disconnect();
				observer = undefined;
				observed = [];
				entries.clear();
				for (const key of keyCounts.keys()) geometry?.clear(key);
				geometry = undefined;
				rects.clear();
				keys.clear();
				keyCounts.clear();
				counts.clear();
			};
		}
	});
}

export interface IntersectionObserverCapabilityOptions extends ObserverProjectionOptions {
	root?: Element | Document | null;
	rootMargin?: string;
	threshold?: number | readonly number[];
	onIntersect?: (entry: IntersectionObserverEntry, bond: Bond) => void;
}

export interface IntersectionObserverSurface {
	observe(element: Element, key?: string): () => void;
	entry(element: Element): IntersectionObserverEntry | undefined;
	isIntersecting(element: Element): boolean;
	readonly observed: readonly Element[];
}

export function intersectionObserverCapability(
	options: IntersectionObserverCapabilityOptions = {}
): Capability<IntersectionObserverSurface> {
	let bondRef: Bond | undefined;
	let observer: IntersectionObserver | undefined;
	let observed = $state<Element[]>([]);
	const entries = new Map<Element, IntersectionObserverEntry>();
	const counts = new Map<Element, number>();
	const surface: IntersectionObserverSurface = {
		observe(element) {
			if (!isBrowser() || typeof IntersectionObserver === 'undefined') return noop;
			const observerOptions: IntersectionObserverInit = {};
			const root = options.root instanceof Document ? null : options.root;
			if (root !== undefined) observerOptions.root = root;
			if (options.rootMargin !== undefined) observerOptions.rootMargin = options.rootMargin;
			if (options.threshold !== undefined) {
				const threshold = options.threshold;
				observerOptions.threshold =
					typeof threshold === 'number' ? threshold : Array.from(threshold);
			}
			observer ??= new IntersectionObserver((nextEntries) => {
				for (const entry of nextEntries) {
					entries.set(entry.target, entry);
					if (bondRef) options.onIntersect?.(entry, bondRef);
				}
			}, observerOptions);
			const count = counts.get(element) ?? 0;
			if (count === 0) {
				observed = [...untrack(() => observed), element];
				observer.observe(element);
			}
			counts.set(element, count + 1);
			let released = false;
			return () => {
				if (released) return;
				released = true;
				const remaining = (counts.get(element) ?? 1) - 1;
				if (remaining > 0) {
					counts.set(element, remaining);
					return;
				}
				counts.delete(element);
				observer?.unobserve(element);
				entries.delete(element);
				observed = untrack(() => observed).filter((item) => item !== element);
			};
		},
		entry(element) {
			return entries.get(element);
		},
		isIntersecting(element) {
			return entries.get(element)?.isIntersecting ?? false;
		},
		get observed() {
			return observed;
		}
	};

	return defineObserverEffect(INTERSECTION_OBSERVER, surface, options, {
		docs: 'Observes element visibility and intersection state.',
		setup(bond) {
			bondRef = bond;
			return () => {
				observer?.disconnect();
				observer = undefined;
				observed = [];
				entries.clear();
				counts.clear();
			};
		}
	});
}

export interface MutationObserverCapabilityOptions extends ObserverProjectionOptions {
	init?: MutationObserverInit;
	onMutation?: (records: MutationRecord[], bond: Bond) => void;
}

export interface MutationObserverSurface {
	observe(element: Node): () => void;
	readonly records: readonly MutationRecord[];
	readonly observed: readonly Node[];
	takeRecords(): MutationRecord[];
}

export function mutationObserverCapability(
	options: MutationObserverCapabilityOptions = {}
): Capability<MutationObserverSurface> {
	let bondRef: Bond | undefined;
	let observer: MutationObserver | undefined;
	let records = $state<MutationRecord[]>([]);
	let observed = $state<Node[]>([]);
	const counts = new Map<Node, number>();
	const observeOptions = options.init ?? { childList: true, subtree: true, attributes: true };
	const surface: MutationObserverSurface = {
		observe(node) {
			if (!isBrowser() || typeof MutationObserver === 'undefined') return noop;
			observer ??= new MutationObserver((nextRecords) => {
				records = [...untrack(() => records), ...nextRecords];
				if (bondRef) options.onMutation?.(nextRecords, bondRef);
			});
			const count = counts.get(node) ?? 0;
			if (count === 0) {
				observed = [...untrack(() => observed), node];
				observer.observe(node, observeOptions);
			}
			counts.set(node, count + 1);
			let released = false;
			return () => {
				if (released) return;
				released = true;
				const remaining = (counts.get(node) ?? 1) - 1;
				if (remaining > 0) {
					counts.set(node, remaining);
					return;
				}
				counts.delete(node);
				observer?.disconnect();
				observed = untrack(() => observed).filter((item) => item !== node);
				for (const target of observed) observer?.observe(target, observeOptions);
			};
		},
		get records() {
			return records;
		},
		get observed() {
			return observed;
		},
		takeRecords() {
			const taken = observer?.takeRecords() ?? [];
			if (taken.length > 0) records = [...untrack(() => records), ...taken];
			return taken;
		}
	};

	return defineObserverEffect(MUTATION_OBSERVER, surface, options, {
		docs: 'Observes DOM mutations for registered targets.',
		setup(bond) {
			bondRef = bond;
			return () => {
				observer?.disconnect();
				observer = undefined;
				records = [];
				observed = [];
				counts.clear();
			};
		}
	});
}

function defineObserverEffect<Surface>(
	slot: CapabilityKey<Surface>,
	surface: Surface,
	options: ObserverProjectionOptions,
	config: { docs: string; setup: (bond: Bond) => void | (() => void) }
): Capability<Surface> {
	const roles = options.roles ?? [];
	return defineCapability<Surface>({
		slot,
		surface,
		meta: {
			projects: roles,
			docs: config.docs
		},
		setup: config.setup,
		behavior: (role) =>
			roles.includes(role)
				? {
						onmount: (node, bond) => {
							if (!(node instanceof Element)) return;
							const observe = (
								surface as { observe?: (element: Element, key?: string) => () => void }
							).observe;
							return observe?.(node, observerKey(node, bond, options.key));
						}
					}
				: undefined
	});
}
