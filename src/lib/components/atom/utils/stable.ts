import type { Bond } from '$svelte-atoms/core/shared';
import type { PresetEntryRecord } from '$svelte-atoms/core/context/preset.svelte';

// Preset entries are factories returning fresh object graphs on every call, defeating all
// downstream reference-keyed caches. stabilizePresetRecord restores reference identity after
// the factory runs: whole-record equal → return previous ref; field-level equal → graft prev
// field refs so field-keyed caches keep hitting even when sibling fields change.

// Depth budget: record → variants → axis map → value (or → compounds → compound → value).
const MAX_DEPTH = 4;

// Bounded structural equality over plain-object/array graphs; functions and class instances
// compare by reference only. Symbol-keyed props participate.
export function structurallyEqual(a: unknown, b: unknown, depth: number = MAX_DEPTH): boolean {
	if (a === b) return true;
	if (depth <= 0) return false;
	if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

	const aIsArray = Array.isArray(a);
	if (aIsArray !== Array.isArray(b)) return false;
	if (aIsArray) {
		const arrA = a as unknown[];
		const arrB = b as unknown[];
		if (arrA.length !== arrB.length) return false;
		for (let i = 0; i < arrA.length; i++) {
			if (!structurallyEqual(arrA[i], arrB[i], depth - 1)) return false;
		}
		return true;
	}

	// Plain objects only — exotic prototypes (class instances, Map, Date)
	// compare by reference above, never structurally.
	const protoA = Object.getPrototypeOf(a);
	if (protoA !== Object.prototype && protoA !== null) return false;
	const protoB = Object.getPrototypeOf(b);
	if (protoB !== Object.prototype && protoB !== null) return false;

	const recA = a as Record<string | symbol, unknown>;
	const recB = b as Record<string | symbol, unknown>;

	const keysA = Object.keys(recA);
	if (keysA.length !== Object.keys(recB).length) return false;
	for (const k of keysA) {
		if (!Object.hasOwn(recB, k)) return false;
		if (!structurallyEqual(recA[k], recB[k], depth - 1)) return false;
	}

	const symsA = Object.getOwnPropertySymbols(recA);
	if (symsA.length !== Object.getOwnPropertySymbols(recB).length) return false;
	for (const s of symsA) {
		if (!Object.hasOwn(recB, s)) return false;
		if (!structurallyEqual(recA[s], recB[s], depth - 1)) return false;
	}
	return true;
}

// The record fields downstream caches key by reference.
const RETAINED_FIELDS = ['variants', 'defaults', 'compounds', 'class'] as const;

// Last record per (entry, bond) — both keys weak, nothing pinned.
const lastRecordByEntry = new WeakMap<object, WeakMap<object, PresetEntryRecord>>();
const NO_BOND: object = {};

// Return the previous record when structurally identical; otherwise graft unchanged
// cache-keyed field references into the fresh record and remember it.
export function stabilizePresetRecord(
	entry: object,
	bond: Bond | null | undefined,
	fresh: PresetEntryRecord
): PresetEntryRecord {
	const bondKey = (bond as unknown as object) ?? NO_BOND;
	let byBond = lastRecordByEntry.get(entry);
	if (!byBond) {
		byBond = new WeakMap();
		lastRecordByEntry.set(entry, byBond);
	}

	const prev = byBond.get(bondKey);
	if (prev !== undefined) {
		if (structurallyEqual(prev, fresh)) return prev;
		for (const field of RETAINED_FIELDS) {
			const prevValue = prev[field];
			const freshValue = fresh[field];
			if (
				prevValue !== undefined &&
				freshValue !== undefined &&
				prevValue !== freshValue &&
				structurallyEqual(prevValue, freshValue)
			) {
				(fresh as Record<string, unknown>)[field] = prevValue;
			}
		}
	}
	byBond.set(bondKey, fresh);
	return fresh;
}
