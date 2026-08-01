import type { Bond } from '$ixirjs/ui/shared';
import type { PresetEntryRecord } from '$ixirjs/ui/preset';

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
const RETAINED_SET = new Set<string>(RETAINED_FIELDS);

// Last record per (entry, bond) — both keys weak, nothing pinned.
const lastRecordByEntry = new WeakMap<object, WeakMap<object, PresetEntryRecord>>();
const NO_BOND: object = {};

// Return the previous record when structurally identical; otherwise graft unchanged
// cache-keyed field references into the fresh record and remember it.
//
// Single traversal: the whole-record equality check compares each own key once at
// `MAX_DEPTH - 1` (fields sit one level below the record root), and the graft step needs
// per-field equality at `MAX_DEPTH` (each field compared as its own root — one level deeper).
// Because depth-(MAX_DEPTH-1) equality implies depth-MAX_DEPTH equality (equal at the shallower
// budget means the level-(MAX_DEPTH-1) nodes were reference-identical, so their whole subtrees
// match at any deeper budget), a retained field found equal during the record walk can be grafted
// without re-walking. Only retained fields that the record walk did NOT prove equal (it stops at
// the first mismatch) are re-checked at the deeper graft budget — preserving the depth asymmetry
// while removing the redundant re-traversal of unchanged fields.
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
	// A constant entry hands back the same object every call (a module-level frozen record is the
	// usual shape). Identity already answers the question stabilization exists to answer, so skip
	// the structural walk — but only on a genuine identity hit, never on frozenness alone: a factory
	// that freezes a *freshly built* record each call still needs stabilizing.
	if (prev === fresh) return prev;
	if (prev !== undefined) {
		const prevRec = prev as Record<string | symbol, unknown>;
		const freshRec = fresh as Record<string | symbol, unknown>;
		const prevKeys = Object.keys(prevRec);
		const prevSyms = Object.getOwnPropertySymbols(prevRec);

		// Retained fields the record walk already proved equal at `MAX_DEPTH - 1`; safe to graft
		// without re-walking (shallower-budget equality implies deeper-budget equality).
		const provenEqual = new Set<string>();

		let recordEqual =
			prevKeys.length === Object.keys(freshRec).length &&
			prevSyms.length === Object.getOwnPropertySymbols(freshRec).length;

		if (recordEqual) {
			for (const k of prevKeys) {
				if (!Object.hasOwn(freshRec, k)) {
					recordEqual = false;
					break;
				}
				if (!structurallyEqual(prevRec[k], freshRec[k], MAX_DEPTH - 1)) {
					recordEqual = false;
					break;
				}
				if (RETAINED_SET.has(k)) provenEqual.add(k);
			}
		}
		if (recordEqual) {
			for (const s of prevSyms) {
				if (
					!Object.hasOwn(freshRec, s) ||
					!structurallyEqual(prevRec[s], freshRec[s], MAX_DEPTH - 1)
				) {
					recordEqual = false;
					break;
				}
			}
		}

		if (recordEqual) return prev;

		for (const field of RETAINED_FIELDS) {
			const prevValue = prev[field];
			const freshValue = fresh[field];
			if (prevValue === undefined || freshValue === undefined || prevValue === freshValue) {
				continue;
			}
			if (provenEqual.has(field) || structurallyEqual(prevValue, freshValue, MAX_DEPTH)) {
				(fresh as Record<string, unknown>)[field] = prevValue;
			}
		}
	}
	byBond.set(bondKey, fresh);
	return fresh;
}
