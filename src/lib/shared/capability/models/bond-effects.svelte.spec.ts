import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { render } from 'vitest-browser-svelte';
import { Bond, bondContextKey, type BondStateProps } from '$ixirjs/ui/shared/bond';
import UseProbe from '$ixirjs/ui/test/shared/capability/use-probe.test.svelte';
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
	reducedMotionCapability,
	resizeObserverCapability,
	scrollMeasurementCapability,
	BODY_SCROLL_LOCK,
	DOCUMENT_DRAG,
	INERT_SIBLINGS,
	INTERSECTION_OBSERVER,
	MEDIA_QUERY,
	MUTATION_OBSERVER,
	OUTSIDE_PRESS_LISTENER,
	POINTER_MODALITY,
	REDUCED_MOTION,
	RESIZE_OBSERVER,
	SCROLL_MEASUREMENT
} from '.';

class TestState {
	scrollTarget = $state<Element>();
}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('bond-effects-test');
	constructor(readonly state = new TestState()) {
		super({}, 'bond-effects-test');
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
			[documentDragCapability(), DOCUMENT_DRAG]
		] as const;

		for (const [capability, slot] of capabilities) {
			expect(capability.slot).toBe(slot);
			expect(capability.setup).toEqual(expect.any(Function));
		}
	});

	it('outsidePressListener dispatches only for presses outside configured targets', () => {
		const target = document.createElement('button');
		document.body.append(target);
		const onOutsidePress = vi.fn();
		const bond = new TestBond();
		bond.capability(outsidePressListener({ targets: target, onOutsidePress }));
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
		bond.capability(bodyScrollLock());
		bond.capability(inertSiblings({ target: surface }));

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
		bond.capability(geometryCapability(geometry));
		bond.capability(resizeCap);
		bond.capability(intersectionCap);
		bond.capability(mutationCap);
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

	it('observer capabilities keep shared and remaining targets observed until their own cleanup', () => {
		const resize = installResizeObserver();
		const intersection = installIntersectionObserver();
		const mutation = installMutationObserver();
		const bond = new TestBond();
		const resizeCap = resizeObserverCapability();
		const intersectionCap = intersectionObserverCapability();
		const mutationCap = mutationObserverCapability();
		bond.capability(geometryCapability(createGeometry()));
		bond.capability(resizeCap);
		bond.capability(intersectionCap);
		bond.capability(mutationCap);
		const { unmount } = render(UseProbe, { bond });
		const first = document.createElement('div');
		const second = document.createElement('div');

		const releaseResizeA = resizeCap.surface!.observe(first);
		const releaseResizeB = resizeCap.surface!.observe(first);
		const releaseIntersectionA = intersectionCap.surface!.observe(first);
		const releaseIntersectionB = intersectionCap.surface!.observe(first);
		const releaseMutationA = mutationCap.surface!.observe(first);
		mutationCap.surface!.observe(second);

		releaseResizeA();
		releaseIntersectionA();
		releaseMutationA();
		expect(resize.unobserve).not.toHaveBeenCalled();
		expect(intersection.unobserve).not.toHaveBeenCalled();
		expect(mutation.observe).toHaveBeenLastCalledWith(
			second,
			expect.objectContaining({ childList: true })
		);

		releaseResizeB();
		releaseIntersectionB();
		expect(resize.unobserve).toHaveBeenCalledWith(first);
		expect(intersection.unobserve).toHaveBeenCalledWith(first);
		unmount();
	});

	it('mediaQueryCapability, reducedMotionCapability, and pointerModalityCapability track globals', () => {
		const mediaWindow = fakeMediaWindow(false);
		const bond = new TestBond();
		const media = mediaQueryCapability({ query: '(min-width: 1px)', window: () => mediaWindow });
		const reduced = reducedMotionCapability({ window: () => mediaWindow });
		const modality = pointerModalityCapability();
		bond.capability(media);
		bond.capability(reduced);
		bond.capability(modality);
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

	it('whole-bond effects keep global body and inert ownership until every owner releases', () => {
		const before = document.createElement('div');
		const surface = document.createElement('main');
		const after = document.createElement('div');
		document.body.append(before, surface, after);
		document.body.style.overflow = 'auto';
		const first = new TestBond();
		const second = new TestBond();
		first.capability(bodyScrollLock());
		first.capability(inertSiblings({ target: surface }));
		second.capability(bodyScrollLock());
		second.capability(inertSiblings({ target: surface }));
		const firstProbe = render(UseProbe, { bond: first });
		const secondProbe = render(UseProbe, { bond: second });

		firstProbe.unmount();
		expect(document.body.style.overflow).toBe('hidden');
		expect((before as HTMLElement & { inert?: boolean }).inert).toBe(true);

		secondProbe.unmount();
		expect(document.body.style.overflow).toBe('auto');
		expect((before as HTMLElement & { inert?: boolean }).inert).toBe(false);
	});

	it('scrollMeasurementCapability waits for a reactive target to become available', () => {
		const state = new TestState();
		const scroller = document.createElement('div');
		Object.defineProperties(scroller, {
			clientWidth: { value: 100, configurable: true },
			clientHeight: { value: 50, configurable: true },
			scrollWidth: { value: 100, configurable: true },
			scrollHeight: { value: 500, configurable: true },
			scrollTop: { value: 25, configurable: true }
		});
		const bond = new TestBond(state);
		const scroll = scrollMeasurementCapability({ target: () => state.scrollTarget });
		bond.capability(scroll);
		const { unmount } = render(UseProbe, { bond });

		state.scrollTarget = scroller;
		flushSync();
		expect(scroll.surface!.y).toBe(25);
		unmount();
	});

	it('scrollMeasurementCapability maintains scroll geometry', () => {
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
		bond.capability(scroll);
		const { unmount } = render(UseProbe, { bond });

		expect(scroll.surface!.y).toBe(40);

		unmount();
	});

	it('outsidePressListener binds to its configured document', () => {
		const alternate = document.implementation.createHTMLDocument('alternate');
		const onOutsidePress = vi.fn();
		const bond = new TestBond();
		bond.capability(outsidePressListener({ document: alternate, onOutsidePress }));
		const { unmount } = render(UseProbe, { bond });

		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onOutsidePress).not.toHaveBeenCalled();
		alternate.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onOutsidePress).toHaveBeenCalledTimes(1);
		unmount();
	});

	it('documentDragCapability provides document-level move/up handling', () => {
		const onMove = vi.fn();
		const onEnd = vi.fn();
		const bond = new TestBond();
		const drag = documentDragCapability({ onMove, onEnd });
		bond.capability(drag);
		const { unmount } = render(UseProbe, { bond });

		drag.surface!.start(new PointerEvent('pointerdown', { clientX: 10, clientY: 20 }));
		document.dispatchEvent(new PointerEvent('pointermove', { clientX: 15, clientY: 18 }));
		document.dispatchEvent(new PointerEvent('pointerup', { clientX: 20, clientY: 30 }));

		expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ deltaX: 5, deltaY: -2 }), bond);
		expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ deltaX: 10, deltaY: 10 }), bond);
		expect(drag.surface!.active).toBe(false);

		unmount();
	});

	it('documentDragCapability only completes the initiating pointer and cancels without an end callback', () => {
		const onMove = vi.fn();
		const onEnd = vi.fn();
		const bond = new TestBond();
		const drag = documentDragCapability({ onMove, onEnd });
		bond.capability(drag);
		const { unmount } = render(UseProbe, { bond });

		drag.surface!.start(new PointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 }));
		document.dispatchEvent(
			new PointerEvent('pointermove', { pointerId: 2, clientX: 10, clientY: 10 })
		);
		document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 2 }));
		expect(onMove).not.toHaveBeenCalled();
		expect(drag.surface!.active).toBe(true);

		document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 }));
		expect(onEnd).not.toHaveBeenCalled();
		expect(drag.surface!.active).toBe(false);
		unmount();
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
	const observe = vi.fn();
	const unobserve = vi.fn();
	const disconnect = vi.fn();
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(next: ResizeObserverCallback) {
				callback = next;
			}
			observe = observe;
			unobserve = unobserve;
			disconnect = disconnect;
		}
	);
	return {
		observe,
		unobserve,
		disconnect,
		emit: (entry: ResizeObserverEntry) => callback([entry], {} as ResizeObserver)
	};
}

function installIntersectionObserver() {
	let callback: IntersectionObserverCallback = () => {};
	const observe = vi.fn();
	const unobserve = vi.fn();
	const disconnect = vi.fn();
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			constructor(next: IntersectionObserverCallback) {
				callback = next;
			}
			observe = observe;
			unobserve = unobserve;
			disconnect = disconnect;
			takeRecords = () => [];
			root = null;
			rootMargin = '';
			thresholds = [];
		}
	);
	return {
		observe,
		unobserve,
		disconnect,
		emit: (entry: IntersectionObserverEntry) => callback([entry], {} as IntersectionObserver)
	};
}

function installMutationObserver() {
	let callback: MutationCallback = () => {};
	const observe = vi.fn();
	const disconnect = vi.fn();
	vi.stubGlobal(
		'MutationObserver',
		class {
			constructor(next: MutationCallback) {
				callback = next;
			}
			observe = observe;
			disconnect = disconnect;
			takeRecords = () => [];
		}
	);
	return {
		observe,
		disconnect,
		emit: (records: MutationRecord[]) => callback(records, {} as MutationObserver)
	};
}
