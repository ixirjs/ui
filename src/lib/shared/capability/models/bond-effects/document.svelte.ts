import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import { isBrowser } from '$ixirjs/ui/utils/dom.svelte';
import {
	firstElement,
	isEnabled,
	isInsideSource,
	listen,
	resolveDocument,
	resolveElements,
	type DocumentSource,
	type EffectGuard,
	type ElementSource
} from '$ixirjs/ui/shared/capability/models/bond-effects/shared';

export const OUTSIDE_PRESS_LISTENER = sharedCapabilityKey<OutsidePressListenerSurface>({
	owner: '@ixirjs/cap',
	name: 'outside-press-listener',
	version: 1
});
export const BODY_SCROLL_LOCK = sharedCapabilityKey<BodyScrollLockSurface>({
	owner: '@ixirjs/cap',
	name: 'body-scroll-lock',
	version: 1
});
export const INERT_SIBLINGS = sharedCapabilityKey<InertSiblingsSurface>({
	owner: '@ixirjs/cap',
	name: 'inert-siblings',
	version: 1
});

type BodyLockRecord = {
	owners: Map<symbol, boolean>;
	overflow: string;
	paddingRight: string;
	document: Document | undefined;
};

type InertRecord = {
	owners: Map<symbol, boolean>;
	inert: boolean | undefined;
	ariaHidden: string | null;
};

const bodyLocks = new WeakMap<HTMLElement, BodyLockRecord>();
const inertOwners = new WeakMap<Element, InertRecord>();

export interface OutsidePressListenerOptions {
	document?: DocumentSource;
	event?: 'pointerdown' | 'mousedown' | 'click';
	targets?: ElementSource;
	ignore?: ElementSource;
	enabled?: EffectGuard;
	listen?: boolean;
	onOutsidePress?: (event: PointerEvent | MouseEvent, bond: Bond) => void;
}

// Only dispatch-time policy is configurable. Listener transport (document/event/listen) belongs
// to capability construction because changing it requires a lifecycle rebind.
export type OutsidePressRuntimeOptions = Pick<
	OutsidePressListenerOptions,
	'enabled' | 'targets' | 'ignore' | 'onOutsidePress'
>;

export interface OutsidePressListenerSurface {
	configure(options: OutsidePressRuntimeOptions): () => void;
	handle(
		event: PointerEvent | MouseEvent,
		bond: Bond,
		options?: OutsidePressListenerOptions
	): boolean;
}

export function outsidePressListener(
	options: OutsidePressListenerOptions = {}
): Capability<OutsidePressListenerSurface> {
	const runtimeLeases = new Map<symbol, OutsidePressRuntimeOptions>();
	const surface: OutsidePressListenerSurface = {
		configure(next) {
			const lease = Symbol('outside-press-config');
			runtimeLeases.set(lease, next);
			return () => runtimeLeases.delete(lease);
		},
		handle(event, bond, next = {}) {
			const runtime = Object.assign({}, ...runtimeLeases.values());
			const config = { ...options, ...runtime, ...next };
			if (!isEnabled(config.enabled, bond)) return false;
			if (isInsideSource(config.ignore, bond, event.target)) return false;
			if (isInsideSource(config.targets, bond, event.target)) return false;
			config.onOutsidePress?.(event, bond);
			return true;
		}
	};

	return defineCapability<OutsidePressListenerSurface>({
		slot: OUTSIDE_PRESS_LISTENER,
		surface,
		meta: {
			docs: 'Global outside pointer listener with configurable inside and ignored targets.'
		},
		setup: (bond) => {
			$effect(() => {
				if (options.listen === false || !isBrowser()) return;
				const doc = resolveDocument(options.document);
				if (!doc) return;
				const type = options.event ?? 'pointerdown';
				return listen(
					doc,
					type,
					(event) => surface.handle(event as PointerEvent | MouseEvent, bond),
					{
						capture: true
					}
				);
			});
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

	return defineCapability<BodyScrollLockSurface>({
		slot: BODY_SCROLL_LOCK,
		surface,
		meta: {
			docs: 'Prevents background scroll while enabled, restoring body styles on teardown.'
		},
		setup: (bond) => {
			$effect(() => {
				locked = false;
				const doc = resolveDocument(options.document);
				const target = firstElement(options.target, bond) ?? doc?.body;
				if (!target || !isEnabled(options.enabled, bond)) return;

				const release = acquireBodyLock(
					target as HTMLElement,
					doc,
					options.paddingCompensation ?? false
				);
				locked = true;
				return () => {
					release();
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

	return defineCapability<InertSiblingsSurface>({
		slot: INERT_SIBLINGS,
		surface,
		meta: {
			docs: 'Marks background or sibling roots inert while a surface is active.'
		},
		setup: (bond) => {
			$effect(() => {
				inerted = [];
				if (!isEnabled(options.enabled, bond)) return;
				const siblings = resolveInertSiblings(options, bond);
				if (siblings.length === 0) return;
				inerted = siblings;
				const release = siblings.map((element) =>
					acquireInert(element, options.ariaHidden ?? true)
				);
				return () => {
					for (const undo of release.reverse()) undo();
					inerted = [];
				};
			});
		}
	});
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

function acquireBodyLock(
	target: HTMLElement,
	document: Document | undefined,
	paddingCompensation: boolean
): () => void {
	let record = bodyLocks.get(target);
	if (!record) {
		record = {
			owners: new Map(),
			overflow: target.style.overflow,
			paddingRight: target.style.paddingRight,
			document: document ?? target.ownerDocument
		};
		bodyLocks.set(target, record);
	}
	const owner = Symbol('body-scroll-lock');
	record.owners.set(owner, paddingCompensation);
	applyBodyLock(target, record);
	let released = false;
	return () => {
		if (released) return;
		released = true;
		record.owners.delete(owner);
		if (record.owners.size === 0) {
			target.style.overflow = record.overflow;
			target.style.paddingRight = record.paddingRight;
			bodyLocks.delete(target);
			return;
		}
		applyBodyLock(target, record);
	};
}

function applyBodyLock(target: HTMLElement, record: BodyLockRecord): void {
	target.style.overflow = 'hidden';
	const compensates = [...record.owners.values()].some(Boolean);
	if (!compensates) {
		target.style.paddingRight = record.paddingRight;
		return;
	}
	const scrollbar =
		(record.document?.defaultView?.innerWidth ?? 0) -
		(record.document?.documentElement.clientWidth ?? 0);
	target.style.paddingRight = scrollbar > 0 ? `${scrollbar}px` : record.paddingRight;
}

function acquireInert(element: Element, ariaHidden: boolean): () => void {
	let record = inertOwners.get(element);
	if (!record) {
		const node = element as HTMLElement & { inert?: boolean };
		record = {
			owners: new Map(),
			inert: node.inert,
			ariaHidden: element.getAttribute('aria-hidden')
		};
		inertOwners.set(element, record);
	}
	const owner = Symbol('inert-siblings');
	record.owners.set(owner, ariaHidden);
	applyInert(element, record);
	let released = false;
	return () => {
		if (released) return;
		released = true;
		record.owners.delete(owner);
		if (record.owners.size === 0) {
			restoreInert(element, record);
			inertOwners.delete(element);
			return;
		}
		applyInert(element, record);
	};
}

function applyInert(element: Element, record: InertRecord): void {
	const node = element as HTMLElement & { inert?: boolean };
	node.inert = true;
	if ([...record.owners.values()].some(Boolean)) element.setAttribute('aria-hidden', 'true');
	else restoreAriaHidden(element, record.ariaHidden);
}

function restoreInert(element: Element, record: InertRecord): void {
	const node = element as HTMLElement & { inert?: boolean };
	node.inert = record.inert ?? false;
	restoreAriaHidden(element, record.ariaHidden);
}

function restoreAriaHidden(element: Element, value: string | null): void {
	if (value === null) element.removeAttribute('aria-hidden');
	else element.setAttribute('aria-hidden', value);
}
