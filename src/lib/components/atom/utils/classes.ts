import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn, type ClassValue } from '$svelte-atoms/core/utils';

// Generational trie memo for the class axis: walks (userClass, presetClass, variantClass)
// through nested Maps; hits are zero-allocation. Eviction is generational (hot→prev wholesale at TRIE_MAX).

// Path-compressed (preset, variant) → result tail; `n` chains rare collisions.
type Tail = { p: string; v: string; r: string; n?: Tail };
type TrieNode = Map<string, TrieNode | Tail>;

const TRIE_MAX = 500;
// Sentinel token for an `undefined`/`null` slot — U+0000 never appears in class strings.
const U = '\u0000';
// Key of the tail record inside a node — separates user parts from preset/variant.
const END = '\u0001';
// Walk verdict: an input shape the trie cannot key (non-string part).
const NOT_CACHEABLE = Symbol('not-cacheable');

let trieHot: TrieNode = new Map();
let triePrev: TrieNode = new Map();
let trieEntries = 0;

const PLACEHOLDER = '$preset';
const PLACEHOLDER_LEN = 7;

function stripPlaceholders(value: string): string {
	return value.indexOf(PLACEHOLDER) === -1 ? value : value.split(PLACEHOLDER).join('');
}

function isStringy(v: unknown): v is string | undefined {
	return v === undefined || typeof v === 'string';
}

// Scan a tail chain for the (preset, variant) pair.
function tailFind(tail: Tail | TrieNode | undefined, p: string, v: string): string | undefined {
	let t = tail as Tail | undefined;
	while (t !== undefined) {
		if (t.p === p && t.v === v) return t.r;
		t = t.n;
	}
	return undefined;
}

// Walk both trie generations in one pass; returns cached result (promoting prev-gen hits),
// undefined on miss, or NOT_CACHEABLE for non-string inputs.
function trieLookup(
	userClass: string | ClassValue | undefined,
	presetClass: string | undefined,
	variantClass: string | undefined
): string | undefined | typeof NOT_CACHEABLE {
	let nh: TrieNode | Tail | undefined = trieHot;
	let np: TrieNode | Tail | undefined = triePrev;

	if (typeof userClass === 'string') {
		nh = (nh as TrieNode).get(userClass);
		np = (np as TrieNode).get(userClass);
	} else if (userClass == null) {
		nh = (nh as TrieNode).get(U);
		np = (np as TrieNode).get(U);
	} else if (Array.isArray(userClass)) {
		// Keep iterating even after both miss — a later non-string item must
		// still flip the verdict to NOT_CACHEABLE (the caller must not insert).
		for (let i = 0; i < userClass.length; i++) {
			const item = userClass[i];
			if (item == null || item === false || item === '') continue;
			if (typeof item !== 'string') return NOT_CACHEABLE;
			nh = nh instanceof Map ? nh.get(item) : undefined;
			np = np instanceof Map ? np.get(item) : undefined;
		}
	} else {
		return NOT_CACHEABLE; // object ClassValue — rare; uncached
	}

	const p = presetClass ?? U;
	const v = variantClass ?? U;

	if (nh instanceof Map) {
		const hit = tailFind(nh.get(END), p, v);
		if (hit !== undefined) return hit;
	}
	if (np instanceof Map) {
		const hit = tailFind(np.get(END), p, v);
		if (hit !== undefined) {
			trieInsert(userClass, presetClass, variantClass, hit); // promote
			return hit;
		}
	}
	return undefined;
}

// Insert along the token stream (inputs already verified cacheable).
function trieInsert(
	userClass: string | ClassValue | undefined,
	presetClass: string | undefined,
	variantClass: string | undefined,
	out: string
): void {
	let n = trieHot;
	const step = (token: string): TrieNode => {
		const next = n.get(token);
		if (next instanceof Map) return next;
		const created: TrieNode = new Map();
		n.set(token, created);
		return created;
	};

	if (typeof userClass === 'string') {
		n = step(userClass);
	} else if (userClass == null) {
		n = step(U);
	} else {
		for (let i = 0; i < (userClass as ClassValue[]).length; i++) {
			const item = (userClass as ClassValue[])[i];
			if (!item) continue; // falsy items contribute nothing (verified cacheable: rest are strings)
			n = step(item as string);
		}
	}

	const p = presetClass ?? U;
	const v = variantClass ?? U;
	const existing = n.get(END) as Tail | undefined;
	// Prepend; replace in place when the pair already exists (promote/refresh).
	let t = existing;
	while (t !== undefined) {
		if (t.p === p && t.v === v) {
			t.r = out;
			return;
		}
		t = t.n;
	}
	n.set(END, existing ? { p, v, r: out, n: existing } : { p, v, r: out });
	trieEntries++;

	if (trieEntries >= TRIE_MAX) {
		triePrev = trieHot;
		trieHot = new Map();
		trieEntries = 0;
	}
}

// Miss fast lane: all parts are plain strings — join manually and run tailwind-merge once.
function mergeJoined(
	userClass: string | string[] | undefined | null,
	presetClass: string | undefined,
	variantClass: string | undefined
): string {
	const v = variantClass ?? '';

	if (typeof userClass === 'string') {
		const lastIdx = userClass.lastIndexOf(PLACEHOLDER);
		if (lastIdx === -1) {
			return twMerge(userClass + ' ' + v);
		}
		const before = stripPlaceholders(userClass.slice(0, lastIdx));
		const after = stripPlaceholders(userClass.slice(lastIdx + PLACEHOLDER_LEN));
		return twMerge(before + ' ' + (presetClass ?? '') + ' ' + v + ' ' + after);
	}

	if (userClass == null) {
		return twMerge(v);
	}

	// Array of strings (falsy items allowed). Single pass: find the LAST exact
	// '$preset' item; bail to the generic path for embedded placeholders.
	let placeholderIdx = -1;
	for (let i = 0; i < userClass.length; i++) {
		const item = userClass[i];
		if (!item) continue;
		if (item === PLACEHOLDER) {
			placeholderIdx = i;
			continue;
		}
		if ((item as string).indexOf(PLACEHOLDER) !== -1) {
			return computeMerged(clsx(userClass as never[]), presetClass, variantClass);
		}
	}

	let joined = '';
	for (let i = 0; i < userClass.length; i++) {
		const item = userClass[i];
		if (item === PLACEHOLDER) {
			if (i === placeholderIdx) joined += ' ' + (presetClass ?? '') + ' ' + v;
			continue;
		}
		if (!item) continue;
		joined += ' ' + (item as string);
	}
	if (placeholderIdx === -1) joined += ' ' + v;
	return twMerge(joined);
}

// Generic merge for uncacheable shapes (object ClassValues, non-string preset/variant).
// One tailwind-merge pass; arrays are walked for the placeholder directly.
function computeMerged(
	userClass: string | ClassValue | undefined,
	presetClass: ClassValue | undefined,
	variantClass: ClassValue | undefined
): string {
	// string user class
	if (typeof userClass === 'string') {
		const lastIdx = userClass.lastIndexOf(PLACEHOLDER);
		if (lastIdx === -1) {
			return cn(userClass, variantClass ?? '');
		}
		const before = stripPlaceholders(userClass.slice(0, lastIdx));
		const after = stripPlaceholders(userClass.slice(lastIdx + PLACEHOLDER_LEN));
		return cn(before, presetClass ?? '', variantClass ?? '', after);
	}

	// no user class
	if (userClass == null) {
		return cn(variantClass ?? '');
	}

	// array user class — the component-root shape
	if (Array.isArray(userClass)) {
		let placeholderIdx = -1;
		for (let i = 0; i < userClass.length; i++) {
			const item = userClass[i];
			if (!item) continue;
			if (typeof item !== 'string') {
				return computeMerged(clsx(userClass as never[]), presetClass, variantClass);
			}
			if (item === PLACEHOLDER) {
				placeholderIdx = i; // keep scanning — LAST exact item wins
				continue;
			}
			if (item.indexOf(PLACEHOLDER) !== -1) {
				// Placeholder embedded inside a longer string item — flatten with
				// clsx (cheap concat, no tailwind-merge) and re-run as a string.
				return computeMerged(clsx(userClass as never[]), presetClass, variantClass);
			}
		}

		if (placeholderIdx === -1) {
			return cn(userClass, variantClass ?? '');
		}

		// Exact-item placeholder: splice preset + variant classes in its place.
		const parts: ClassValue[] = [];
		for (let i = 0; i < userClass.length; i++) {
			const item = userClass[i];
			if (item === PLACEHOLDER) {
				if (i === placeholderIdx) parts.push(presetClass ?? '', variantClass ?? '');
				continue;
			}
			parts.push(item);
		}
		return cn(parts);
	}

	// object ClassValue (e.g. `{ active: true }`) — rare
	return computeMerged(clsx(userClass as never), presetClass, variantClass);
}

// Merges userClass + presetClass + variantClass into a Tailwind-safe string. The last `$preset`
// placeholder controls the injection point; earlier sentinels are discarded.
export function mergeClassesWithPreset(
	userClass: string | ClassValue | undefined,
	presetClass: ClassValue | undefined,
	variantClass: ClassValue | undefined
): string {
	if (isStringy(presetClass) && isStringy(variantClass)) {
		const cached = trieLookup(userClass, presetClass, variantClass);
		if (typeof cached === 'string') return cached;
		if (cached !== NOT_CACHEABLE) {
			const out = mergeJoined(
				userClass as string | string[] | undefined | null,
				presetClass,
				variantClass
			);
			trieInsert(userClass, presetClass, variantClass, out);
			return out;
		}
	}
	return computeMerged(userClass, presetClass, variantClass);
}
