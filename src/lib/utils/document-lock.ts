// Reference-counted document effects shared by overlays: one body scroll lock and one `inert`
// marking per element, however many overlays ask for them. Each acquire returns its release; the
// original inline styles and attributes come back when the last owner releases.

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

export function acquireBodyLock(
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

export function acquireInert(element: Element, ariaHidden: boolean): () => void {
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

/** Siblings of `target` under `root` (its parent by default), excluding `target`'s own subtree. */
export function siblingsOf(target: Element, root?: Element | null): Element[] {
	const parent = root ?? target.parentElement;
	if (!parent) return [];
	const out: Element[] = [];
	for (const child of Array.from(parent.children)) {
		if (child === target || target.contains(child)) continue;
		out.push(child);
	}
	return out;
}
