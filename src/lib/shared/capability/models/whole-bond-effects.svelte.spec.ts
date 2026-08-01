import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Bond, BondState, bondContextKey, type BondStateProps } from '../../bond';
import UseProbe from '../use-probe.svelte';
import {
	bodyScrollLock,
	createGeometry,
	documentDragCapability,
	geometryCapability,
	inertSiblings,
	intersectionObserverCapability,
	mediaQueryCapability,
	mutationObserverCapability,
	outsidePressListener,
	pointerModalityCapability,
	portalLayerCapability,
	reducedMotionCapability,
	resizeObserverCapability,
	scrollMeasurementCapability,
	virtualWindowCapability,
	BODY_SCROLL_LOCK,
	DOCUMENT_DRAG,
	INERT_SIBLINGS,
	INTERSECTION_OBSERVER,
	MEDIA_QUERY,
	MUTATION_OBSERVER,
	OUTSIDE_PRESS_LISTENER,
	POINTER_MODALITY,
	PORTAL_LAYER,
	REDUCED_MOTION,
	RESIZE_OBSERVER,
	SCROLL_MEASUREMENT,
	VIRTUAL_WINDOW,
	type ScrollMeasurementSurface
} from '.';

class TestState extends BondState<BondStateProps> {
	constructor() {
		super({});
	}
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('whole-bond-effects-test');
	constructor(state = new TestState()) {
		super(state, 'whole-bond-effects-test');
	}
}

describe('whole-bond effect primitives', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		document.body.removeAttribute('style');
		document.body.replaceChildren();
	});

	it('exposes every missing primitive as a Layer 1 effect capability', () => {
		const mediaWindow = fakeMediaWindow(false);
		const scroll = fakeScrollSurface({ y: 20, height: 100 });
		const capabilities = [
			[outsidePressListener(), OUTSIDE_PRESS_LISTENER],
			[bodyScrollLock({ enabled: false }), BODY_SCROLL_LOCK],
			[inertSiblings({ enabled: false }), INERT_SIBLINGS],
			[resizeObserverCapability(), RESIZE_OBSERVER],
			[intersectionObserverCapability(), INTERSECTION_OBSERVER],
			[mutationObserverCapability(), MUTATION_OBSERVER],
			[mediaQueryCapability({ query: '(min-width: 1px)', window: () => mediaWindow }), MEDIA_QUERY],
			[reducedMotionCapability({ window: () => mediaWindow }), REDUCED_MOTION],
			[pointerModalityCapability(), POINTER_MODALITY],
			[scrollMeasurementCapability({ enabled: false }), SCROLL_MEASUREMENT],
			[virtualWindowCapability({ count: 10, itemSize: 10, scroll }), VIRTUAL_WINDOW],
			[documentDragCapability(), DOCUMENT_DRAG],
			[portalLayerCapability(), PORTAL_LAYER]
		] as const;

		for (const [capability, slot] of capabilities) {
			expect(capability.slot).toBe(slot);
			expect(capability.meta).toMatchObject({ layer: 1, kind: 'effect' });
			expect(capability.setup).toEqual(expect.any(Function));
		}
	});

	it('outsidePressListener dispatches only for presses outside configured targets', () => {
		const target = document.createElement('button');
		document.body.append(target);
		const onOutsidePress = vi.fn();
		const bond = new TestBond();
		bond.state.capability(outsidePressListener({ targets: target, onOutsidePress }));
		const { unmount } = render(UseProbe, { bond });

		target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

		expect(onOutsidePress).toHaveBeenCalledTimes(1);
		unmount();

		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onOutsidePress).toHaveBeenCalledTimes(1);
	});

	it('bodyScrollLock and inertSiblings apply and restore document-level state', () => {
		const before = document.createElement('div');
		const surface = document.createElement('main');
		const after = document.createElement('div');
		document.body.append(before, surface, after);
		document.body.style.overflow = 'auto';
		const bond = new TestBond();
		bond.state.capability(bodyScrollLock());
		bond.state.capability(inertSiblings({ target: surface }));

		const { unmount } = render(UseProbe, { bond });

		expect(document.body.style.overflow).toBe('hidden');
		expect((before as HTMLElement & { inert?: boolean }).inert).toBe(true);
		expect(after.getAttribute('aria-hidden')).toBe('true');

		unmount();

		expect(document.body.style.overflow).toBe('auto');
		expect((before as HTMLElement & { inert?: boolean }).inert).toBe(false);
		expect(after.getAttribute('aria-hidden')).toBeNull();
	});

	it('observer capabilities expose observed nodes and update callbacks/surfaces', () => {
		const resize = installResizeObserver();
		const intersection = installIntersectionObserver();
		const mutation = installMutationObserver();
		const element = document.createElement('div');
		element.id = 'measured';
		document.body.append(element);

		const geometry = createGeometry();
		const bond = new TestBond();
		const resizeCap = resizeObserverCapability();
		const intersectionCap = intersectionObserverCapability();
		const mutationCap = mutationObserverCapability();
		bond.state.capability(geometryCapability(geometry));
		bond.state.capability(resizeCap);
		bond.state.capability(intersectionCap);
		bond.state.capability(mutationCap);
		const { unmount } = render(UseProbe, { bond });

		resizeCap.surface!.observe(element);
		intersectionCap.surface!.observe(element);
		mutationCap.surface!.observe(element);

		resize.emit({
			target: element,
			contentRect: rect(10, 20)
		} as unknown as ResizeObserverEntry);
		intersection.emit({
			target: element,
			isIntersecting: true
		} as unknown as IntersectionObserverEntry);
		mutation.emit([{ target: element, type: 'childList' } as unknown as MutationRecord]);

		expect(geometry.rect('measured')?.width).toBe(10);
		expect(intersectionCap.surface!.isIntersecting(element)).toBe(true);
		expect(mutationCap.surface!.records).toHaveLength(1);

		unmount();
		expect(resize.disconnect).toHaveBeenCalled();
		expect(intersection.disconnect).toHaveBeenCalled();
		expect(mutation.disconnect).toHaveBeenCalled();
	});

	it('mediaQueryCapability, reducedMotionCapability, and pointerModalityCapability track globals', () => {
		const mediaWindow = fakeMediaWindow(false);
		const bond = new TestBond();
		const media = mediaQueryCapability({ query: '(min-width: 1px)', window: () => mediaWindow });
		const reduced = reducedMotionCapability({ window: () => mediaWindow });
		const modality = pointerModalityCapability();
		bond.state.capability(media);
		bond.state.capability(reduced);
		bond.state.capability(modality);
		const { unmount } = render(UseProbe, { bond });

		expect(media.surface!.matches).toBe(false);
		expect(reduced.surface!.matches).toBe(false);

		mediaWindow.change(true);
		expect(media.surface!.matches).toBe(true);
		expect(reduced.surface!.matches).toBe(true);

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
		expect(modality.surface!.modality).toBe('keyboard');
		document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }));
		expect(modality.surface!.modality).toBe('pointer');
		expect(modality.surface!.pointerType).toBe('touch');

		unmount();
	});

	it('scrollMeasurementCapability and virtualWindowCapability maintain scroll geometry and ranges', () => {
		const scroller = document.createElement('div');
		Object.defineProperties(scroller, {
			clientWidth: { value: 200, configurable: true },
			clientHeight: { value: 100, configurable: true },
			scrollWidth: { value: 200, configurable: true },
			scrollHeight: { value: 1000, configurable: true },
			scrollTop: { value: 40, configurable: true }
		});
		document.body.append(scroller);

		const bond = new TestBond();
		const scroll = scrollMeasurementCapability({ target: scroller });
		bond.state.capability(scroll);
		const { unmount } = render(UseProbe, { bond });

		expect(scroll.surface!.y).toBe(40);

		const virtual = virtualWindowCapability({
			count: 100,
			itemSize: 20,
			overscan: 2,
			scroll: scroll.surface!
		});
		bond.state.capability(virtual);
		virtual.setup?.(bond);

		expect(virtual.surface!.start).toBe(2);
		expect(virtual.surface!.end).toBe(7);
		expect(virtual.surface!.overscanStart).toBe(0);
		expect(virtual.surface!.overscanEnd).toBe(9);

		unmount();
	});

	it('documentDragCapability provides document-level move/up handling', () => {
		const onMove = vi.fn();
		const onEnd = vi.fn();
		const bond = new TestBond();
		const drag = documentDragCapability({ onMove, onEnd });
		bond.state.capability(drag);
		const { unmount } = render(UseProbe, { bond });

		drag.surface!.start(new PointerEvent('pointerdown', { clientX: 10, clientY: 20 }));
		document.dispatchEvent(new PointerEvent('pointermove', { clientX: 15, clientY: 18 }));
		document.dispatchEvent(new PointerEvent('pointerup', { clientX: 20, clientY: 30 }));

		expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ deltaX: 5, deltaY: -2 }), bond);
		expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ deltaX: 10, deltaY: 10 }), bond);
		expect(drag.surface!.active).toBe(false);

		unmount();
	});

	it('portalLayerCapability creates and removes a portal host', () => {
		const bond = new TestBond();
		const portal = portalLayerCapability({ id: 'test-portal-layer', zIndex: 4000 });
		bond.state.capability(portal);
		const { unmount } = render(UseProbe, { bond });

		expect(portal.surface!.host).toBe(document.getElementById('test-portal-layer'));
		expect(portal.surface!.host?.style.zIndex).toBe('4000');
		expect(portal.surface!.nextZIndex()).toBe(4001);

		unmount();
		expect(document.getElementById('test-portal-layer')).toBeNull();
	});
});

function rect(width: number, height: number): DOMRectReadOnly {
	return {
		x: 0,
		y: 0,
		width,
		height,
		top: 0,
		right: width,
		bottom: height,
		left: 0,
		toJSON: () => ({})
	};
}

function fakeScrollSurface(partial: Partial<ScrollMeasurementSurface>): ScrollMeasurementSurface {
	const measurement = {
		x: partial.x ?? 0,
		y: partial.y ?? 0,
		width: partial.width ?? 0,
		height: partial.height ?? 0,
		scrollWidth: partial.scrollWidth ?? 0,
		scrollHeight: partial.scrollHeight ?? 0
	};
	return {
		...measurement,
		measure: () => measurement
	};
}

function fakeMediaWindow(initial: boolean): Window & { change(matches: boolean): void } {
	let matches = initial;
	const listeners = new Set<(event: MediaQueryListEvent) => void>();
	const query: MediaQueryList = {
		matches,
		media: '',
		onchange: null,
		addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
			listeners.add(listener as (event: MediaQueryListEvent) => void);
		},
		removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
			listeners.delete(listener as (event: MediaQueryListEvent) => void);
		},
		addListener: (listener) => {
			listeners.add(listener as (event: MediaQueryListEvent) => void);
		},
		removeListener: (listener) => {
			listeners.delete(listener as (event: MediaQueryListEvent) => void);
		},
		dispatchEvent: () => true
	};
	return {
		matchMedia: () => query,
		change(next: boolean) {
			matches = next;
			Object.defineProperty(query, 'matches', { value: matches, configurable: true });
			for (const listener of listeners) {
				listener({ matches } as MediaQueryListEvent);
			}
		}
	} as unknown as Window & { change(matches: boolean): void };
}

function installResizeObserver() {
	let callback: ResizeObserverCallback = () => {};
	const disconnect = vi.fn();
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(next: ResizeObserverCallback) {
				callback = next;
			}
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = disconnect;
		}
	);
	return {
		disconnect,
		emit: (entry: ResizeObserverEntry) => callback([entry], {} as ResizeObserver)
	};
}

function installIntersectionObserver() {
	let callback: IntersectionObserverCallback = () => {};
	const disconnect = vi.fn();
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			constructor(next: IntersectionObserverCallback) {
				callback = next;
			}
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = disconnect;
			takeRecords = () => [];
			root = null;
			rootMargin = '';
			thresholds = [];
		}
	);
	return {
		disconnect,
		emit: (entry: IntersectionObserverEntry) => callback([entry], {} as IntersectionObserver)
	};
}

function installMutationObserver() {
	let callback: MutationCallback = () => {};
	const disconnect = vi.fn();
	vi.stubGlobal(
		'MutationObserver',
		class {
			constructor(next: MutationCallback) {
				callback = next;
			}
			observe = vi.fn();
			disconnect = disconnect;
			takeRecords = () => [];
		}
	);
	return {
		disconnect,
		emit: (records: MutationRecord[]) => callback(records, {} as MutationObserver)
	};
}
