import clsx from 'clsx';
import { DEV } from 'esm-env';
import type { BondVirtualElement } from './types';

type Handler = (...args: unknown[]) => unknown;

export type AtomAttachment<E extends Element | BondVirtualElement = Element | BondVirtualElement> =
	(node: E) => void | (() => void);

export type MergeLayerOptions = {
	source?: string;
	nextSource?: string;
	nextIsUser?: boolean;
	warn?: (message: string) => void;
};

const TRUE_WINS_ATTRIBUTES = new Set(['disabled', 'inert', 'hidden']);
const ARIA_TOKEN_LIST_ATTRIBUTES = new Set([
	'aria-controls',
	'aria-describedby',
	'aria-flowto',
	'aria-labelledby',
	'aria-owns'
]);

export function mergeAttributeLayer(
	base: Record<string, unknown>,
	next: Record<string, unknown>,
	options: MergeLayerOptions = {}
): Record<string, unknown> {
	const out: Record<string, unknown> = { ...base };
	for (const key in next) {
		if (!Object.hasOwn(next, key)) continue;
		out[key] = mergeAttributeValue(key, out[key], next[key], options);
	}
	return out;
}

export function mergeHandlerLayer(
	base: Record<string, unknown>,
	next: Record<string, unknown>,
	options: MergeLayerOptions = {}
): Record<string, unknown> {
	const out: Record<string, unknown> = { ...base };
	for (const key in next) {
		if (!Object.hasOwn(next, key)) continue;
		const prior = out[key];
		const incoming = next[key];
		out[key] =
			typeof prior === 'function' && typeof incoming === 'function'
				? composeHandlers(prior as Handler, incoming as Handler, options)
				: incoming;
	}
	return out;
}

export function mergeSpreadProps<
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(
	base: Record<string | symbol, unknown> | undefined,
	next: Record<string | symbol, unknown> | undefined,
	options: MergeLayerOptions = {}
): Record<string | symbol, unknown> {
	// Nothing to layer on: the merge would walk `base` key by key only to hand back an exact copy.
	// Every atom-bearing part hits this whenever the consumer passes no props of its own, so return
	// the same reference instead. Safe because `base` is always a freshly built Atom spread and no
	// caller mutates the result — they either spread it or read from it.
	//
	// Only this direction is safe. With `base` absent, `next` still has to go through the loop
	// below: `mergeAttributeValue` transforms values even with no prior (class through clsx, style
	// parsed and re-serialised), so `next` cannot be handed back untouched.
	if (base && isEmptyProps(next)) return base;

	// Spread rather than a hand-written string+symbol key walk. Equivalent because spread takes own
	// enumerable string AND symbol keys, and every symbol on these layers arrives through an object
	// literal or plain assignment — nothing here defines one non-enumerable.
	//
	// This is a simplification, NOT an optimization. In isolation spread beats a manual key loop by
	// ~17x (V8 clones the backing store through one CloneObject IC), but measured on the real SSR
	// path the change is neutral: the early return above already skips most copies, and the server
	// spread carries no symbols at all. Don't cite the microbenchmark as a reason to spread elsewhere.
	const out: Record<string | symbol, unknown> = base ? { ...base } : {};
	if (!next) return out;

	for (const key in next) {
		if (!Object.hasOwn(next, key)) continue;
		const prior = out[key];
		const incoming = next[key];
		out[key] =
			isEventHandlerKey(key) && typeof prior === 'function' && typeof incoming === 'function'
				? composeHandlers(prior as Handler, incoming as Handler, options)
				: mergeAttributeValue(key, prior, incoming, options);
	}

	for (const key of Object.getOwnPropertySymbols(next)) {
		const prior = out[key];
		const incoming = next[key];
		out[key] =
			typeof prior === 'function' && typeof incoming === 'function'
				? composeAttachments(prior as AtomAttachment<E>, incoming as AtomAttachment<E>)
				: incoming;
	}

	return out;
}

/** Whether a props layer carries nothing to merge — no own string keys and no symbol keys. */
function isEmptyProps(props: Record<string | symbol, unknown> | undefined): boolean {
	if (!props) return true;
	for (const key in props) {
		if (Object.hasOwn(props, key)) return false;
	}
	return Object.getOwnPropertySymbols(props).length === 0;
}

export function composeHandlers(
	base: Handler,
	next: Handler,
	options: MergeLayerOptions = {}
): Handler {
	const first = options.nextIsUser ? next : base;
	const second = options.nextIsUser ? base : next;
	return (...args: unknown[]) => {
		const result = first(...args);
		if (!isDefaultPrevented(args[0])) second(...args);
		return result;
	};
}

export function composeAttachments<
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(base: AtomAttachment<E>, next: AtomAttachment<E>): AtomAttachment<E> {
	return (node: E) => {
		const cleanupBase = base(node);
		const cleanupNext = next(node);
		return () => {
			if (typeof cleanupNext === 'function') cleanupNext();
			if (typeof cleanupBase === 'function') cleanupBase();
		};
	};
}

function mergeAttributeValue(
	key: string,
	base: unknown,
	next: unknown,
	options: MergeLayerOptions
): unknown {
	if (key === 'id') return mergeId(base, next, options);
	if (key === 'class') return mergeClass(base, next);
	if (key === 'style') return mergeStyle(base, next);
	if (TRUE_WINS_ATTRIBUTES.has(key)) return mergeTrueWins(base, next);
	if (key === 'role') return mergeRole(base, next, options);
	if (key.startsWith('data-'))
		return mergeWarnOnConflict('data attribute', key, base, next, options);
	if (key.startsWith('aria-')) return mergeAria(key, base, next, options);
	return next;
}

function mergeId(base: unknown, next: unknown, options: MergeLayerOptions): unknown {
	if (!hasValue(base)) return next;
	if (!hasValue(next)) return base;
	if (Object.is(base, next)) return base;
	if (options.nextIsUser) return next;
	warnConflict('id attribute', 'id', base, next, options, 'keeping the generated id');
	return base;
}

function mergeClass(base: unknown, next: unknown): unknown {
	if (!hasClassValue(base)) return next;
	if (!hasClassValue(next)) return base;
	return clsx(base as never, next as never);
}

function mergeStyle(base: unknown, next: unknown): unknown {
	if (!hasValue(base)) return next;
	if (!hasValue(next)) return base;

	const baseEntries = styleEntries(base);
	const nextEntries = styleEntries(next);
	if (!baseEntries || !nextEntries) return next;

	const merged = new Map(baseEntries);
	for (const [property, value] of nextEntries) merged.set(property, value);
	return serializeStyle(merged);
}

function mergeTrueWins(base: unknown, next: unknown): unknown {
	if (isPresentBooleanAttribute(base) || isPresentBooleanAttribute(next)) return true;
	return next === undefined ? base : next;
}

function mergeRole(base: unknown, next: unknown, options: MergeLayerOptions): unknown {
	if (!hasValue(base)) return next;
	if (!hasValue(next)) return base;
	if (Object.is(base, next)) return base;
	warnConflict('role attribute', 'role', base, next, options, 'using the later role');
	return next;
}

function mergeAria(key: string, base: unknown, next: unknown, options: MergeLayerOptions): unknown {
	if (ARIA_TOKEN_LIST_ATTRIBUTES.has(key) && typeof base === 'string' && typeof next === 'string') {
		return mergeTokenList(base, next);
	}
	return mergeWarnOnConflict('ARIA attribute', key, base, next, options);
}

function mergeWarnOnConflict(
	kind: string,
	key: string,
	base: unknown,
	next: unknown,
	options: MergeLayerOptions
): unknown {
	if (hasConflictValue(base) && hasConflictValue(next) && !Object.is(base, next)) {
		warnConflict(kind, key, base, next, options, 'using the later value');
	}
	return next;
}

function mergeTokenList(base: string, next: string): string {
	const tokens: string[] = [];
	for (const value of `${base} ${next}`.split(/\s+/)) {
		if (!value || tokens.includes(value)) continue;
		tokens.push(value);
	}
	return tokens.join(' ');
}

function styleEntries(value: unknown): Array<[string, string]> | undefined {
	if (typeof value === 'string') {
		const entries: Array<[string, string]> = [];
		for (const part of value.split(';')) {
			const trimmed = part.trim();
			if (!trimmed) continue;
			const separator = trimmed.indexOf(':');
			if (separator < 0) return undefined;
			const property = trimmed.slice(0, separator).trim();
			const propertyValue = trimmed.slice(separator + 1).trim();
			if (!property) continue;
			entries.push([property, propertyValue]);
		}
		return entries;
	}

	if (!isPlainStyleObject(value)) return undefined;
	const entries: Array<[string, string]> = [];
	for (const [property, propertyValue] of Object.entries(value)) {
		if (propertyValue == null || propertyValue === false) continue;
		entries.push([property, String(propertyValue)]);
	}
	return entries;
}

function serializeStyle(entries: Map<string, string>): string {
	return Array.from(entries, ([property, value]) => `${property}: ${value};`).join(' ');
}

function isPlainStyleObject(value: unknown): value is Record<string, unknown> {
	return (
		value != null &&
		typeof value === 'object' &&
		!Array.isArray(value) &&
		Object.getPrototypeOf(value) === Object.prototype
	);
}

function hasValue(value: unknown): boolean {
	return value !== undefined && value !== null && value !== false;
}

function hasConflictValue(value: unknown): boolean {
	return value !== undefined && value !== null;
}

function hasClassValue(value: unknown): boolean {
	if (!hasValue(value)) return false;
	if (Array.isArray(value)) return value.some(hasClassValue);
	return value !== '';
}

function isPresentBooleanAttribute(value: unknown): boolean {
	return value !== undefined && value !== null && value !== false;
}

function isEventHandlerKey(key: string): boolean {
	return /^on[a-z]/.test(key);
}

function isDefaultPrevented(value: unknown): boolean {
	return Boolean(
		value != null &&
		typeof value === 'object' &&
		'defaultPrevented' in value &&
		(value as { defaultPrevented?: boolean }).defaultPrevented
	);
}

function warnConflict(
	kind: string,
	key: string,
	base: unknown,
	next: unknown,
	options: MergeLayerOptions,
	resolution: string
): void {
	if (!DEV) return;
	const warn = options.warn ?? console.warn;
	const source = options.source ? ` in ${options.source}` : '';
	const nextSource = options.nextSource ? ` from ${options.nextSource}` : '';
	warn(
		`[ixirjs] ${kind} "${key}" conflict${source}${nextSource}: ${formatValue(base)} -> ${formatValue(next)}; ${resolution}.`
	);
}

function formatValue(value: unknown): string {
	if (typeof value === 'string') return JSON.stringify(value);
	if (typeof value === 'symbol') return value.description ?? value.toString();
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}
