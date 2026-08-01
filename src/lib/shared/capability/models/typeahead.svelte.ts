import { definePolicyCapability, sharedCapabilityKey, type Capability } from '../capability';
import { Collection } from '../../bond/collection.svelte';
import { collectionSlot } from './collection.svelte';
import { ROVING, type RovingFocus } from './roving.svelte';

export const TYPEAHEAD = sharedCapabilityKey<TypeaheadSurface>('@svelte-atoms/cap:typeahead');

export interface TypeaheadOptions<T = unknown> {
	// Roles that receive printable-key search. Default ['container'].
	roles?: readonly string[];
	// Milliseconds before the buffered query is cleared. Default 700.
	timeout?: number;
	// Extract searchable text from an item. Defaults to label/element text/value/id.
	text?: (item: T, id: string) => string | undefined | null;
	// Skip items that should not be reached by typeahead.
	disabled?: (item: T, id: string) => boolean;
	// Gate the policy, e.g. only while a popover is open.
	enabled?: boolean | (() => boolean);
	// preventDefault on a matched printable key. Default true.
	preventDefault?: boolean;
}

export interface TypeaheadSurface {
	readonly buffer: string;
	search(query: string): string | null;
	handleKeydown(ev: KeyboardEvent): string | null;
	clear(): void;
	destroy(): void;
}

type SearchMode = 'current' | 'next';

export function createTypeahead<T>(
	collection: Collection<T>,
	roving: RovingFocus<T>,
	options: TypeaheadOptions<T> = {}
): TypeaheadSurface {
	const timeout = options.timeout ?? 700;
	const text = options.text ?? defaultText;
	const disabled = options.disabled ?? defaultDisabled;
	const preventDefault = options.preventDefault ?? true;
	let buffer = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	const isEnabled = () =>
		typeof options.enabled === 'function' ? options.enabled() : (options.enabled ?? true);

	const clearTimer = () => {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
	};

	const scheduleClear = () => {
		clearTimer();
		timer = setTimeout(() => {
			buffer = '';
			timer = undefined;
		}, timeout);
	};

	const find = (query: string, mode: SearchMode): string | null => {
		const needle = normalize(query);
		if (!needle) return null;

		const entries = collection.entries;
		if (entries.length === 0) return null;

		const activeIndex = roving.activeId === null ? -1 : collection.indexOf(roving.activeId);
		const start = mode === 'current' && activeIndex >= 0 ? activeIndex : activeIndex + 1;

		for (let offset = 0; offset < entries.length; offset++) {
			const index = (Math.max(start, 0) + offset) % entries.length;
			const [id, item] = entries[index]!;
			if (disabled(item, id)) continue;
			const haystack = normalize(text(item, id) ?? '');
			if (haystack.startsWith(needle)) {
				return roving.goto(id);
			}
		}

		return null;
	};

	const surface: TypeaheadSurface = {
		get buffer() {
			return buffer;
		},
		search(query) {
			return find(query, 'next');
		},
		handleKeydown(ev) {
			if (!isEnabled() || ev.defaultPrevented || !isPrintableKey(ev)) return null;

			const key = ev.key;
			const hadBuffer = buffer.length > 0;
			const nextBuffer = buffer + key;
			let match = find(nextBuffer, hadBuffer ? 'current' : 'next');

			if (match === null && hadBuffer) {
				match = find(key, 'next');
				buffer = key;
			} else {
				buffer = nextBuffer;
			}

			scheduleClear();
			if (match !== null && preventDefault) ev.preventDefault();
			return match;
		},
		clear() {
			clearTimer();
			buffer = '';
		},
		destroy() {
			surface.clear();
		}
	};

	return surface;
}

export function typeaheadCapability<T>(
	collection: Collection<T>,
	roving: RovingFocus<T>,
	options: TypeaheadOptions<T> = {}
): Capability<TypeaheadSurface> {
	const roles = options.roles ?? ['container'];
	const surface = createTypeahead(collection, roving, options);

	return definePolicyCapability<TypeaheadSurface>({
		slot: TYPEAHEAD,
		surface,
		requires: [collectionSlot(collection.kind), ROVING],
		setup: () => () => surface.destroy(),
		meta: {
			projects: roles,
			docs: 'Buffered printable-key typeahead policy over a collection-backed roving focus surface.'
		},
		behavior(role) {
			if (!roles.includes(role)) return undefined;
			return {
				handlers: () => ({
					onkeydown: ((ev: Event) => surface.handleKeydown(ev as KeyboardEvent)) as (
						ev: Event
					) => void
				})
			};
		}
	});
}

function isPrintableKey(ev: KeyboardEvent): boolean {
	if (ev.altKey || ev.ctrlKey || ev.metaKey) return false;
	return ev.key.length === 1 && ev.key.trim().length > 0;
}

function normalize(value: string): string {
	return value.trim().toLocaleLowerCase();
}

function defaultText<T>(item: T, id: string): string {
	const label = readString(item, 'label');
	if (label) return label;

	const props = readObject(item, 'props');
	const propLabel = readString(props, 'label');
	if (propLabel) return propLabel;

	const element = readObject(item, 'element');
	const innerText = readString(element, 'innerText');
	if (innerText) return innerText;
	const textContent = readString(element, 'textContent');
	if (textContent) return textContent;

	const value = readString(props, 'value') ?? readString(item, 'value');
	if (value) return value;

	return readString(props, 'id') ?? readString(item, 'id') ?? id;
}

function defaultDisabled<T>(item: T): boolean {
	const props = readObject(item, 'props');
	if (readBoolean(props, 'disabled') || readBoolean(item, 'disabled')) return true;

	const element = readObject(item, 'element');
	const ariaDisabled = readString(element, 'ariaDisabled');
	if (ariaDisabled === 'true') return true;

	const getAttribute = readFunction(element, 'getAttribute');
	if (!getAttribute) return false;
	return (
		Boolean(getAttribute.call(element, 'disabled')) ||
		getAttribute.call(element, 'aria-disabled') === 'true'
	);
}

function readObject(value: unknown, key: string): Record<string, unknown> | undefined {
	if (value === null || typeof value !== 'object') return undefined;
	const read = (value as Record<string, unknown>)[key];
	return read !== null && typeof read === 'object' ? (read as Record<string, unknown>) : undefined;
}

function readString(value: unknown, key: string): string | undefined {
	if (value === null || typeof value !== 'object') return undefined;
	const read = (value as Record<string, unknown>)[key];
	return typeof read === 'string' ? read : undefined;
}

function readBoolean(value: unknown, key: string): boolean {
	if (value === null || typeof value !== 'object') return false;
	return (value as Record<string, unknown>)[key] === true;
}

function readFunction(value: unknown, key: string): ((...args: unknown[]) => unknown) | undefined {
	if (value === null || typeof value !== 'object') return undefined;
	const read = (value as Record<string, unknown>)[key];
	return typeof read === 'function' ? (read as (...args: unknown[]) => unknown) : undefined;
}
