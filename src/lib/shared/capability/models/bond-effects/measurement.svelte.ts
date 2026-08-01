import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import {
	isElement,
	isEnabled,
	isNode,
	isWindow,
	listen,
	noop,
	resolveDocument,
	type DocumentSource,
	type EffectGuard,
	type ElementSource,
	type WindowSource
} from '$ixirjs/ui/shared/capability/models/bond-effects/shared';

export const SCROLL_MEASUREMENT = sharedCapabilityKey<ScrollMeasurementSurface>({
	owner: '@ixirjs/cap',
	name: 'scroll-measurement',
	version: 1
});
export const DOCUMENT_DRAG = sharedCapabilityKey<DocumentDragSurface>({
	owner: '@ixirjs/cap',
	name: 'document-drag',
	version: 1
});

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

	return defineCapability<ScrollMeasurementSurface>({
		slot: SCROLL_MEASUREMENT,
		surface,
		meta: {
			docs: 'Maintains scroll position and scrollable geometry for a target.'
		},
		setup: (bond) => {
			$effect(() => {
				const target = resolveScrollTarget(options.target, bond);
				if (!target || !isEnabled(options.enabled, bond)) return;
				const update = () => {
					if (!isEnabled(options.enabled, bond)) return;
					measurement = measureScrollTarget(target);
					options.onMeasure?.(measurement, bond);
				};
				update();
				const offScroll = listen(target, 'scroll', update, { passive: true });
				const resizeTarget = isWindow(target) ? target : target.ownerDocument.defaultView;
				const offResize = resizeTarget
					? listen(resizeTarget, 'resize', update, { passive: true })
					: noop;
				return () => {
					offResize();
					offScroll();
				};
			});
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
	let pointerId: number | undefined;
	const surface: DocumentDragSurface = {
		get active() {
			return active;
		},
		start(event, callbacks = {}) {
			if (!bondRef) return;
			const currentTarget = event.currentTarget;
			const doc = options.document
				? resolveDocument(options.document)
				: isNode(currentTarget)
					? currentTarget.ownerDocument
					: resolveDocument(undefined);
			if (!doc) return;
			surface.cancel();
			startEvent = event;
			pointerId = event.pointerId;
			active = true;
			const move = (next: Event) => {
				if (!startEvent || !bondRef) return;
				const pointer = next as PointerEvent;
				if (pointer.pointerId !== pointerId) return;
				const detail = dragDetail(startEvent, pointer);
				options.onMove?.(detail, bondRef);
				callbacks.move?.(detail, bondRef);
			};
			const end = (next: Event) => {
				if (!startEvent || !bondRef) return;
				const pointer = next as PointerEvent;
				if (pointer.pointerId !== pointerId) return;
				const detail = dragDetail(startEvent, pointer);
				options.onEnd?.(detail, bondRef);
				callbacks.end?.(detail, bondRef);
				surface.cancel();
			};
			const cancel = (next: Event) => {
				if ((next as PointerEvent).pointerId === pointerId) surface.cancel();
			};
			const offMove = listen(doc, 'pointermove', move);
			const offUp = listen(doc, 'pointerup', end);
			const offCancel = listen(doc, 'pointercancel', cancel);
			cleanup = () => {
				offCancel();
				offUp();
				offMove();
			};
		},
		cancel() {
			cleanup();
			cleanup = noop;
			startEvent = undefined;
			pointerId = undefined;
			active = false;
		}
	};

	return defineCapability<DocumentDragSurface>({
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

function resolveScrollTarget(
	source: ScrollMeasurementCapabilityOptions['target'],
	bond: Bond
): Element | Window | undefined {
	if (!source) return typeof window !== 'undefined' ? window : undefined;
	if (isWindow(source) || isElement(source)) return source;
	if (typeof source !== 'function') return undefined;
	const value = source(bond);
	return isWindow(value) || isElement(value) ? value : undefined;
}

function measureScrollTarget(target: Element | Window): ScrollGeometry {
	if (isWindow(target)) {
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

function dragDetail(start: PointerEvent, current: PointerEvent): DocumentDragDetail {
	return {
		start,
		current,
		deltaX: current.clientX - start.clientX,
		deltaY: current.clientY - start.clientY
	};
}
