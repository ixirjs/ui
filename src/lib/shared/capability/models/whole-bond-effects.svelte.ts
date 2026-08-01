import { defineEffectCapability, sharedCapabilityKey, type Capability } from '../capability';
import type { Bond } from '../../bond';
import { containsTarget, isBrowser } from '../../../utils/dom.svelte';
import { GEOMETRY, type GeometryRect } from './geometry.svelte';

export const OUTSIDE_PRESS_LISTENER = sharedCapabilityKey<OutsidePressListenerSurface>(
	'@svelte-atoms/cap:outside-press-listener'
);
export const BODY_SCROLL_LOCK = sharedCapabilityKey<BodyScrollLockSurface>(
	'@svelte-atoms/cap:body-scroll-lock'
);
export const INERT_SIBLINGS = sharedCapabilityKey<InertSiblingsSurface>(
	'@svelte-atoms/cap:inert-siblings'
);
export const RESIZE_OBSERVER = sharedCapabilityKey<ResizeObserverSurface>(
	'@svelte-atoms/cap:resize-observer'
);
export const INTERSECTION_OBSERVER = sharedCapabilityKey<IntersectionObserverSurface>(
	'@svelte-atoms/cap:intersection-observer'
);
export const MUTATION_OBSERVER = sharedCapabilityKey<MutationObserverSurface>(
	'@svelte-atoms/cap:mutation-observer'
);
export const MEDIA_QUERY = sharedCapabilityKey<MediaQuerySurface>('@svelte-atoms/cap:media-query');
export const REDUCED_MOTION = sharedCapabilityKey<MediaQuerySurface>(
	'@svelte-atoms/cap:reduced-motion'
);
export const POINTER_MODALITY = sharedCapabilityKey<PointerModalitySurface>(
	'@svelte-atoms/cap:pointer-modality'
);
export const SCROLL_MEASUREMENT = sharedCapabilityKey<ScrollMeasurementSurface>(
	'@svelte-atoms/cap:scroll-measurement'
);
export const VIRTUAL_WINDOW = sharedCapabilityKey<VirtualWindowSurface>(
	'@svelte-atoms/cap:virtual-window'
);
export const DOCUMENT_DRAG = sharedCapabilityKey<DocumentDragSurface>(
	'@svelte-atoms/cap:document-drag'
);
export const PORTAL_LAYER = sharedCapabilityKey<PortalLayerSurface>(
	'@svelte-atoms/cap:portal-layer'
);

export type EffectGuard = boolean | ((bond: Bond) => boolean);
export type ElementSource =
	| Element
	| null
	| undefined
	| readonly (Element | null | undefined)[]
	| ((bond: Bond) => Element | null | undefined | readonly (Element | null | undefined)[]);
export type DocumentSource = Document | (() => Document | undefined);
export type WindowSource = Window | (() => Window | undefined);

export interface OutsidePressListenerOptions {
	event?: 'pointerdown' | 'mousedown' | 'click';
	targets?: ElementSource;
	ignore?: ElementSource;
	enabled?: EffectGuard;
	listen?: boolean;
	onOutsidePress?: (event: PointerEvent | MouseEvent, bond: Bond) => void;
}

export interface OutsidePressListenerSurface {
	configure(options: OutsidePressListenerOptions): () => void;
	handle(
		event: PointerEvent | MouseEvent,
		bond: Bond,
		options?: OutsidePressListenerOptions
	): boolean;
}

export function outsidePressListener(
	options: OutsidePressListenerOptions = {}
): Capability<OutsidePressListenerSurface> {
	let runtime: OutsidePressListenerOptions = {};
	const surface: OutsidePressListenerSurface = {
		configure(next) {
			runtime = { ...runtime, ...next };
			return () => {
				for (const key of Object.keys(next) as (keyof OutsidePressListenerOptions)[]) {
					if (Object.is(runtime[key], next[key])) delete runtime[key];
				}
			};
		},
		handle(event, bond, next = {}) {
			const config = { ...options, ...runtime, ...next };
			if (!isEnabled(config.enabled, bond)) return false;
			if (isInsideSource(config.ignore, bond, event.target)) return false;
			if (isInsideSource(config.targets, bond, event.target)) return false;
			config.onOutsidePress?.(event, bond);
			return true;
		}
	};

	return defineEffectCapability<OutsidePressListenerSurface>({
		slot: OUTSIDE_PRESS_LISTENER,
		surface,
		meta: {
			docs: 'Global outside pointer listener with configurable inside and ignored targets.'
		},
		setup: (bond) => {
			if (options.listen === false) return;
			if (!isBrowser()) return;
			const type = options.event ?? 'pointerdown';
			return listen(
				window,
				type,
				(event) => surface.handle(event as PointerEvent | MouseEvent, bond),
				{
					capture: true
				}
			);
		}
	});
}

export interface BodyScrollLockOptions {
	enabled?: EffectGuard;
	target?: ElementSource;
	document?: DocumentSource;
	paddingCompensation?: boolean;
}

export interface BodyScrollLockSurface {
	readonly locked: boolean;
}

export function bodyScrollLock(
	options: BodyScrollLockOptions = {}
): Capability<BodyScrollLockSurface> {
	let locked = $state(false);
	const surface: BodyScrollLockSurface = {
		get locked() {
			return locked;
		}
	};

	return defineEffectCapability<BodyScrollLockSurface>({
		slot: BODY_SCROLL_LOCK,
		surface,
		meta: {
			docs: 'Prevents background scroll while enabled, restoring body styles on teardown.'
		},
		setup: (bond) => {
			$effect(() => {
				const doc = resolveDocument(options.document);
				const target = firstElement(options.target, bond) ?? doc?.body;
				if (!target) return;
				if (!isEnabled(options.enabled, bond)) return;

				const body = target as HTMLElement;
				const previousOverflow = body.style.overflow;
				const previousPaddingRight = body.style.paddingRight;
				body.style.overflow = 'hidden';

				if (options.paddingCompensation) {
					const scrollbar =
						(doc?.defaultView?.innerWidth ?? 0) - (doc?.documentElement.clientWidth ?? 0);
					if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
				}

				locked = true;
				return () => {
					body.style.overflow = previousOverflow;
					body.style.paddingRight = previousPaddingRight;
					locked = false;
				};
			});
		}
	});
}

export interface InertSiblingsOptions {
	enabled?: EffectGuard;
	target?: ElementSource;
	siblings?: ElementSource;
	root?: ElementSource;
	ariaHidden?: boolean;
}

export interface InertSiblingsSurface {
	readonly inerted: readonly Element[];
}

export function inertSiblings(
	options: InertSiblingsOptions = {}
): Capability<InertSiblingsSurface> {
	let inerted = $state<Element[]>([]);
	const surface: InertSiblingsSurface = {
		get inerted() {
			return inerted;
		}
	};

	return defineEffectCapability<InertSiblingsSurface>({
		slot: INERT_SIBLINGS,
		surface,
		meta: {
			docs: 'Marks background or sibling roots inert while a surface is active.'
		},
		setup: (bond) => {
			$effect(() => {
				if (!isEnabled(options.enabled, bond)) return;
				const siblings = resolveInertSiblings(options, bond);
				if (siblings.length === 0) return;
				inerted = siblings;
				const restore = siblings.map((element) => setInert(element, options.ariaHidden ?? true));
				return () => {
					for (const undo of restore.reverse()) undo();
					inerted = [];
				};
			});
		}
	});
}

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
	let observed = $state<Element[]>([]);
	const entries = new Map<Element, ResizeObserverEntry>();
	const rects = new Map<string, GeometryRect>();
	const keys = new Map<Element, string>();
	const surface: ResizeObserverSurface = {
		observe(element, key) {
			if (!isBrowser() || typeof ResizeObserver === 'undefined') return noop;
			const geometryKey = key ?? observerKey(element, bondRef, options.key);
			keys.set(element, geometryKey);
			observer ??= new ResizeObserver((nextEntries) => {
				for (const entry of nextEntries) {
					entries.set(entry.target, entry);
					const currentKey = keys.get(entry.target);
					if (currentKey) {
						const rect = domRectToGeometry(entry.contentRect);
						rects.set(currentKey, rect);
						bondRef?.state.surface(GEOMETRY)?.setRect(currentKey, rect);
					}
					if (bondRef) options.onResize?.(entry, bondRef);
				}
			});
			if (!observed.includes(element)) observed = [...observed, element];
			observer.observe(element, options.box ? { box: options.box } : undefined);
			return () => {
				observer?.unobserve(element);
				entries.delete(element);
				const currentKey = keys.get(element);
				if (currentKey) {
					rects.delete(currentKey);
					bondRef?.state.surface(GEOMETRY)?.clear(currentKey);
				}
				keys.delete(element);
				observed = observed.filter((item) => item !== element);
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
			return () => {
				observer?.disconnect();
				observer = undefined;
				observed = [];
				entries.clear();
				rects.clear();
				keys.clear();
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
			if (!observed.includes(element)) observed = [...observed, element];
			observer.observe(element);
			return () => {
				observer?.unobserve(element);
				entries.delete(element);
				observed = observed.filter((item) => item !== element);
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
	const surface: MutationObserverSurface = {
		observe(node) {
			if (!isBrowser() || typeof MutationObserver === 'undefined') return noop;
			observer ??= new MutationObserver((nextRecords) => {
				records = [...records, ...nextRecords];
				if (bondRef) options.onMutation?.(nextRecords, bondRef);
			});
			if (!observed.includes(node)) observed = [...observed, node];
			observer.observe(node, options.init ?? { childList: true, subtree: true, attributes: true });
			return () => {
				observer?.disconnect();
				observed = observed.filter((item) => item !== node);
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
			if (taken.length > 0) records = [...records, ...taken];
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
			};
		}
	});
}

export interface MediaQueryCapabilityOptions {
	query: string;
	window?: WindowSource;
	onChange?: (matches: boolean, event: MediaQueryListEvent | MediaQueryList, bond: Bond) => void;
}

export interface MediaQuerySurface {
	readonly query: string;
	readonly matches: boolean;
}

export function mediaQueryCapability(
	options: string | MediaQueryCapabilityOptions
): Capability<MediaQuerySurface> {
	const config = typeof options === 'string' ? { query: options } : options;
	let matches = $state(false);
	const surface: MediaQuerySurface = {
		query: config.query,
		get matches() {
			return matches;
		}
	};

	return defineEffectCapability<MediaQuerySurface>({
		slot: MEDIA_QUERY,
		surface,
		meta: {
			docs: 'Subscribes to a media query and exposes its current match state.'
		},
		setup: (bond) =>
			setupMediaQuery(config, surface, (next, event) => {
				matches = next;
				config.onChange?.(next, event, bond);
			})
	});
}

export interface ReducedMotionCapabilityOptions {
	window?: WindowSource;
	onChange?: (matches: boolean, event: MediaQueryListEvent | MediaQueryList, bond: Bond) => void;
}

export function reducedMotionCapability(
	options: ReducedMotionCapabilityOptions = {}
): Capability<MediaQuerySurface> {
	let matches = $state(false);
	const query = '(prefers-reduced-motion: reduce)';
	const surface: MediaQuerySurface = {
		query,
		get matches() {
			return matches;
		}
	};

	return defineEffectCapability<MediaQuerySurface>({
		slot: REDUCED_MOTION,
		surface,
		meta: {
			docs: 'Subscribes to prefers-reduced-motion and exposes the current match state.'
		},
		setup: (bond) =>
			setupMediaQuery({ ...options, query }, surface, (next, event) => {
				matches = next;
				options.onChange?.(next, event, bond);
			})
	});
}

export type PointerModality = 'keyboard' | 'pointer' | 'virtual';

export interface PointerModalityCapabilityOptions {
	document?: DocumentSource;
	initial?: PointerModality;
	onChange?: (modality: PointerModality, bond: Bond, event: Event) => void;
}

export interface PointerModalitySurface {
	readonly modality: PointerModality;
	readonly pointerType: string | undefined;
}

export function pointerModalityCapability(
	options: PointerModalityCapabilityOptions = {}
): Capability<PointerModalitySurface> {
	let modality = $state<PointerModality>(options.initial ?? 'virtual');
	let pointerType = $state<string | undefined>();
	const surface: PointerModalitySurface = {
		get modality() {
			return modality;
		},
		get pointerType() {
			return pointerType;
		}
	};

	return defineEffectCapability<PointerModalitySurface>({
		slot: POINTER_MODALITY,
		surface,
		meta: {
			docs: 'Tracks whether keyboard or pointer interaction is the current input modality.'
		},
		setup: (bond) => {
			const doc = resolveDocument(options.document);
			if (!doc) return;
			const set = (next: PointerModality, event: Event, nextPointerType?: string) => {
				modality = next;
				pointerType = nextPointerType;
				options.onChange?.(next, bond, event);
			};
			const offPointer = listen(doc, 'pointerdown', (event) => {
				const pointer = event as PointerEvent;
				set('pointer', pointer, pointer.pointerType);
			});
			const offKey = listen(doc, 'keydown', (event) => {
				set('keyboard', event);
			});
			return () => {
				offPointer();
				offKey();
			};
		}
	});
}

export interface ScrollGeometry {
	x: number;
	y: number;
	width: number;
	height: number;
	scrollWidth: number;
	scrollHeight: number;
}

export interface ScrollMeasurementCapabilityOptions {
	target?: ElementSource | WindowSource;
	enabled?: EffectGuard;
	onMeasure?: (measurement: ScrollGeometry, bond: Bond) => void;
}

export interface ScrollMeasurementSurface extends ScrollGeometry {
	measure(): ScrollGeometry;
}

export function scrollMeasurementCapability(
	options: ScrollMeasurementCapabilityOptions = {}
): Capability<ScrollMeasurementSurface> {
	let measurement = $state<ScrollGeometry>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		scrollWidth: 0,
		scrollHeight: 0
	});
	const surface: ScrollMeasurementSurface = {
		get x() {
			return measurement.x;
		},
		get y() {
			return measurement.y;
		},
		get width() {
			return measurement.width;
		},
		get height() {
			return measurement.height;
		},
		get scrollWidth() {
			return measurement.scrollWidth;
		},
		get scrollHeight() {
			return measurement.scrollHeight;
		},
		measure() {
			return measurement;
		}
	};

	return defineEffectCapability<ScrollMeasurementSurface>({
		slot: SCROLL_MEASUREMENT,
		surface,
		meta: {
			docs: 'Maintains scroll position and scrollable geometry for a target.'
		},
		setup: (bond) => {
			const target = resolveScrollTarget(options.target, bond);
			if (!target) return;
			const update = () => {
				if (!isEnabled(options.enabled, bond)) return;
				measurement = measureScrollTarget(target);
				options.onMeasure?.(measurement, bond);
			};
			update();
			const offScroll = listen(target, 'scroll', update, { passive: true });
			const resizeTarget = target instanceof Window ? target : target.ownerDocument.defaultView;
			const offResize = resizeTarget
				? listen(resizeTarget, 'resize', update, { passive: true })
				: noop;
			return () => {
				offResize();
				offScroll();
			};
		}
	});
}

export interface VirtualWindowRange {
	start: number;
	end: number;
	overscanStart: number;
	overscanEnd: number;
	offsetBefore: number;
	offsetAfter: number;
}

export interface VirtualWindowCapabilityOptions {
	count: number | (() => number);
	itemSize: number | ((index: number) => number);
	overscan?: number;
	scroll?: ScrollMeasurementSurface;
	onRange?: (range: VirtualWindowRange, bond: Bond) => void;
}

export interface VirtualWindowSurface extends VirtualWindowRange {
	recalculate(): VirtualWindowRange;
}

export function virtualWindowCapability(
	options: VirtualWindowCapabilityOptions
): Capability<VirtualWindowSurface> {
	let bondRef: Bond | undefined;
	let range = $state<VirtualWindowRange>(emptyRange());
	const surface: VirtualWindowSurface = {
		get start() {
			return range.start;
		},
		get end() {
			return range.end;
		},
		get overscanStart() {
			return range.overscanStart;
		},
		get overscanEnd() {
			return range.overscanEnd;
		},
		get offsetBefore() {
			return range.offsetBefore;
		},
		get offsetAfter() {
			return range.offsetAfter;
		},
		recalculate() {
			range = calculateVirtualRange(options);
			if (bondRef) options.onRange?.(range, bondRef);
			return range;
		}
	};

	return defineEffectCapability<VirtualWindowSurface>({
		slot: VIRTUAL_WINDOW,
		surface,
		meta: {
			docs: 'Maintains the visible and overscanned item range for virtualized collections.'
		},
		setup: (bond) => {
			bondRef = bond;
			surface.recalculate();
		}
	});
}

export interface DocumentDragDetail {
	start: PointerEvent;
	current: PointerEvent;
	deltaX: number;
	deltaY: number;
}

export interface DocumentDragCallbacks {
	move?: (detail: DocumentDragDetail, bond: Bond) => void;
	end?: (detail: DocumentDragDetail, bond: Bond) => void;
}

export interface DocumentDragCapabilityOptions {
	document?: DocumentSource;
	onMove?: (detail: DocumentDragDetail, bond: Bond) => void;
	onEnd?: (detail: DocumentDragDetail, bond: Bond) => void;
}

export interface DocumentDragSurface {
	readonly active: boolean;
	start(event: PointerEvent, callbacks?: DocumentDragCallbacks): void;
	cancel(): void;
}

export function documentDragCapability(
	options: DocumentDragCapabilityOptions = {}
): Capability<DocumentDragSurface> {
	let bondRef: Bond | undefined;
	let active = $state(false);
	let cleanup = noop;
	let startEvent: PointerEvent | undefined;
	const surface: DocumentDragSurface = {
		get active() {
			return active;
		},
		start(event, callbacks = {}) {
			if (!bondRef) return;
			const currentTarget = event.currentTarget;
			const doc =
				resolveDocument(options.document) ??
				(currentTarget instanceof Node ? currentTarget.ownerDocument : document) ??
				undefined;
			if (!doc) return;
			startEvent = event;
			active = true;
			cleanup();
			const move = (next: Event) => {
				if (!startEvent || !bondRef) return;
				const pointer = next as PointerEvent;
				const detail = dragDetail(startEvent, pointer);
				options.onMove?.(detail, bondRef);
				callbacks.move?.(detail, bondRef);
			};
			const end = (next: Event) => {
				if (!startEvent || !bondRef) return;
				const pointer = next as PointerEvent;
				const detail = dragDetail(startEvent, pointer);
				options.onEnd?.(detail, bondRef);
				callbacks.end?.(detail, bondRef);
				surface.cancel();
			};
			const offMove = listen(doc, 'pointermove', move);
			const offUp = listen(doc, 'pointerup', end);
			cleanup = () => {
				offUp();
				offMove();
			};
		},
		cancel() {
			cleanup();
			cleanup = noop;
			startEvent = undefined;
			active = false;
		}
	};

	return defineEffectCapability<DocumentDragSurface>({
		slot: DOCUMENT_DRAG,
		surface,
		meta: {
			docs: 'Provides document-level pointer move/up handling for drag interactions.'
		},
		setup: (bond) => {
			bondRef = bond;
			return () => {
				surface.cancel();
				bondRef = undefined;
			};
		}
	});
}

export interface PortalLayerCapabilityOptions {
	document?: DocumentSource;
	id?: string;
	zIndex?: number;
	contain?: boolean;
}

export interface PortalLayerSurface {
	readonly host: HTMLElement | undefined;
	readonly zIndex: number;
	nextZIndex(): number;
}

export function portalLayerCapability(
	options: PortalLayerCapabilityOptions = {}
): Capability<PortalLayerSurface> {
	let host = $state<HTMLElement | undefined>();
	let next = options.zIndex ?? 1000;
	const surface: PortalLayerSurface = {
		get host() {
			return host;
		},
		get zIndex() {
			return options.zIndex ?? 1000;
		},
		nextZIndex() {
			return ++next;
		}
	};

	return defineEffectCapability<PortalLayerSurface>({
		slot: PORTAL_LAYER,
		surface,
		meta: {
			docs: 'Creates and exposes a portal layer host with z-index allocation.'
		},
		setup: () => {
			const doc = resolveDocument(options.document);
			if (!doc?.body) return;
			const id = options.id ?? 'svelte-atoms-portal-layer';
			const existing = doc.getElementById(id) as HTMLElement | null;
			const created = !existing;
			host = existing ?? doc.createElement('div');
			host.id = id;
			host.dataset.svelteAtomsPortalLayer = '';
			host.style.position = 'relative';
			host.style.zIndex = String(options.zIndex ?? 1000);
			if (options.contain ?? true) host.style.contain = 'layout style';
			if (created) doc.body.append(host);
			return () => {
				if (created && host?.childNodes.length === 0) host.remove();
				host = undefined;
			};
		}
	});
}

function defineObserverEffect<Surface>(
	slot: symbol,
	surface: Surface,
	options: ObserverProjectionOptions,
	config: { docs: string; setup: (bond: Bond) => void | (() => void) }
): Capability<Surface> {
	const roles = options.roles ?? [];
	return defineEffectCapability<Surface>({
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

function setupMediaQuery(
	options: MediaQueryCapabilityOptions,
	surface: MediaQuerySurface,
	set: (matches: boolean, event: MediaQueryListEvent | MediaQueryList) => void
): void | (() => void) {
	const win = resolveWindow(options.window);
	if (!win?.matchMedia) return;
	const query = win.matchMedia(surface.query);
	set(query.matches, query);
	const listener = (event: MediaQueryListEvent) => set(event.matches, event);
	query.addEventListener?.('change', listener);
	query.addListener?.(listener);
	return () => {
		query.removeEventListener?.('change', listener);
		query.removeListener?.(listener);
	};
}

function resolveElements(source: ElementSource | undefined, bond: Bond): Element[] {
	const value = typeof source === 'function' ? source(bond) : source;
	const items = Array.isArray(value) ? value : [value];
	return items.filter((item): item is Element => item instanceof Element);
}

function firstElement(source: ElementSource | undefined, bond: Bond): Element | undefined {
	return resolveElements(source, bond)[0];
}

function isInsideSource(
	source: ElementSource | undefined,
	bond: Bond,
	target: EventTarget | null
): boolean {
	return resolveElements(source, bond).some((element) => containsTarget(element, target));
}

function resolveDocument(source: DocumentSource | undefined): Document | undefined {
	if (source) return typeof source === 'function' ? source() : source;
	return isBrowser() ? document : undefined;
}

function resolveWindow(source: WindowSource | undefined): Window | undefined {
	if (source) return typeof source === 'function' ? source() : source;
	return isBrowser() ? window : undefined;
}

function isEnabled(enabled: EffectGuard | undefined, bond: Bond): boolean {
	if (typeof enabled === 'function') return enabled(bond);
	return enabled !== false;
}

function resolveInertSiblings(options: InertSiblingsOptions, bond: Bond): Element[] {
	if (options.siblings) return resolveElements(options.siblings, bond);
	const targets = resolveElements(options.target, bond);
	if (targets.length === 0) return [];
	const root = firstElement(options.root, bond);
	const siblings = new Set<Element>();
	for (const target of targets) {
		const parent = root ?? target.parentElement;
		if (!parent) continue;
		for (const child of Array.from(parent.children)) {
			if (targets.some((item) => item === child || item.contains(child))) continue;
			siblings.add(child);
		}
	}
	return [...siblings];
}

function setInert(element: Element, ariaHidden: boolean): () => void {
	const node = element as HTMLElement & { inert?: boolean };
	const previousInert = node.inert;
	const previousAriaHidden = element.getAttribute('aria-hidden');
	node.inert = true;
	if (ariaHidden) element.setAttribute('aria-hidden', 'true');
	return () => {
		node.inert = previousInert;
		if (ariaHidden) {
			if (previousAriaHidden === null) element.removeAttribute('aria-hidden');
			else element.setAttribute('aria-hidden', previousAriaHidden);
		}
	};
}

function observerKey(
	element: Element,
	bond: Bond | undefined,
	key: string | ((element: Element, bond: Bond) => string) | undefined
): string {
	if (typeof key === 'string') return key;
	if (typeof key === 'function' && bond) return key(element, bond);
	return element.id || element.getAttribute('data-kind') || 'element';
}

function domRectToGeometry(rect: DOMRectReadOnly): GeometryRect {
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

function resolveScrollTarget(
	source: ScrollMeasurementCapabilityOptions['target'],
	bond: Bond
): Element | Window | undefined {
	if (!source) return isBrowser() ? window : undefined;
	if (isWindow(source) || source instanceof Element) return source;
	if (typeof source !== 'function') return undefined;
	const value = source(bond);
	return isWindow(value) || value instanceof Element ? value : undefined;
}

function measureScrollTarget(target: Element | Window): ScrollGeometry {
	if (target instanceof Window) {
		const doc = target.document.documentElement;
		return {
			x: target.scrollX,
			y: target.scrollY,
			width: target.innerWidth,
			height: target.innerHeight,
			scrollWidth: doc.scrollWidth,
			scrollHeight: doc.scrollHeight
		};
	}
	return {
		x: target.scrollLeft,
		y: target.scrollTop,
		width: target.clientWidth,
		height: target.clientHeight,
		scrollWidth: target.scrollWidth,
		scrollHeight: target.scrollHeight
	};
}

function calculateVirtualRange(options: VirtualWindowCapabilityOptions): VirtualWindowRange {
	const count = typeof options.count === 'function' ? options.count() : options.count;
	if (count <= 0) return emptyRange();
	const scroll = options.scroll?.measure() ?? {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		scrollWidth: 0,
		scrollHeight: 0
	};
	const sizeAt = (index: number) =>
		typeof options.itemSize === 'function' ? options.itemSize(index) : options.itemSize;
	const itemSize = Math.max(sizeAt(0), 1);
	const overscan = options.overscan ?? 1;
	const start = clamp(Math.floor(scroll.y / itemSize), 0, count - 1);
	const visibleCount = Math.max(Math.ceil(scroll.height / itemSize), 1);
	const end = clamp(start + visibleCount, start + 1, count);
	const overscanStart = clamp(start - overscan, 0, count);
	const overscanEnd = clamp(end + overscan, overscanStart, count);
	return {
		start,
		end,
		overscanStart,
		overscanEnd,
		offsetBefore: overscanStart * itemSize,
		offsetAfter: Math.max(count - overscanEnd, 0) * itemSize
	};
}

function emptyRange(): VirtualWindowRange {
	return {
		start: 0,
		end: 0,
		overscanStart: 0,
		overscanEnd: 0,
		offsetBefore: 0,
		offsetAfter: 0
	};
}

function dragDetail(start: PointerEvent, current: PointerEvent): DocumentDragDetail {
	return {
		start,
		current,
		deltaX: current.clientX - start.clientX,
		deltaY: current.clientY - start.clientY
	};
}

function listen(
	target: EventTarget,
	type: string,
	handler: EventListener,
	options?: AddEventListenerOptions
): () => void {
	target.addEventListener(type, handler, options);
	return () => target.removeEventListener(type, handler, options);
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function isWindow(value: unknown): value is Window {
	return typeof Window !== 'undefined' && value instanceof Window;
}

function noop(): void {}
