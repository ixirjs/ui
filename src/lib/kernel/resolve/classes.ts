import clsx from 'clsx';
import { cn, type ClassValue } from '$ixirjs/ui/utils';

const PLACEHOLDER = '$preset';

/**
 * Strip any remaining sentinel. `split().join()` allocates an array and a string even when there is
 * nothing to strip, and on the shared class path that ran twice per rendered part — it and its
 * caller were together ~5.5% of SSR self time on a card page. Nearly every part carries exactly one
 * `$preset`, so the guard hits almost always.
 */
function withoutPreset(value: string): string {
	return value.includes(PLACEHOLDER) ? value.split(PLACEHOLDER).join('') : value;
}

/**
 * Resolved merges, keyed on the class array's FIRST entry.
 *
 * The class-only lane has been cached since it existed — `plan.defaultClass` is resolved once per
 * plan, `finalClasses` holds the rest per (plan, preset entry). The rich lane had no cache at any
 * level, so every `Kernel.element` part re-ran the whole merge per instance: class merging is
 * **8.0% of datagrid SSR self time against 1.4% on card**, and the delta is entirely lane. A grid
 * pays it rows times cells.
 *
 * **The key must not be built here.** A joined-string key is the obvious design and it does not
 * work: measured on this box, `Map.get` costs 4.6 ns for a module-level literal but **128.5 ns for
 * a freshly joined array**, because a rope built this call has no cached hash and must be flattened
 * and hashed before the probe — against ~198 ns for the entire merge it was meant to replace. That
 * is the real content of the note in `presentation-path-perf-2026-08` §2 that took a memo on `cn`
 * off the candidate list: `twMerge`'s own LRU already pays exactly that fresh-string hash, so a
 * value-keyed string memo reproduces the cost one frame higher and measures as a wash.
 *
 * So the key is `userClass[0]`, a module-level literal at every hot call site (`datagrid` cell and
 * row, `button`, and `KernelNode.elementConfig`'s `plan.class`) and therefore already interned with
 * a cached hash. Past the probe everything is `===`; nothing here ever hashes.
 *
 * Entries snapshot their inputs and compare element-wise, never by array reference, so a caller
 * that mutates a reference-stable array in place still misses. Anything that is not a flat array of
 * strings — nested arrays, clsx's object form, class functions — is never stored, so a live bond
 * read can never be served from here. The preset factory itself runs upstream, in
 * `resolvePresentation`'s `resolveEntry`, and is untouched by this cache.
 */
type MergedClass = { user: readonly unknown[]; preset: unknown; variant: unknown; result: string };

const merged = new Map<string, MergedClass[]>();
const KEY_LIMIT = 512;
const BUCKET_LIMIT = 8;

/** Storable: a string, nothing, or a flat array of those. Anything else is recomputed forever. */
function storable(value: unknown): boolean {
	if (!value || typeof value === 'string') return true;
	if (!Array.isArray(value)) return false;
	for (const item of value) if (item && typeof item !== 'string') return false;
	return true;
}

/**
 * Element-wise, so an array mutated in place misses. The `===` head is the common case: a shipped
 * preset record is frozen once at module scope (`preset/default.ts`), so its class array is
 * reference-stable and settles in one pointer compare.
 */
function sameClass(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}

// Merges preset + variant + consumer classes. The last `$preset` controls placement;
// earlier placeholders are removed.
export function mergeClassesWithPreset(
	userClass: string | ClassValue | undefined,
	presetClass: ClassValue | undefined,
	variantClass: ClassValue | undefined
): string {
	if (typeof userClass === 'string') {
		const index = userClass.lastIndexOf(PLACEHOLDER);
		if (index !== -1) {
			return cn(
				withoutPreset(userClass.slice(0, index)),
				presetClass,
				variantClass,
				// The tail is taken from AFTER the last occurrence, so it provably holds no sentinel —
				// stripping it was a guaranteed no-op walk on every rendered part.
				userClass.slice(index + PLACEHOLDER.length)
			);
		}
	}

	if (Array.isArray(userClass)) {
		const first = userClass[0];
		// `''` is deliberately not a key. Roughly 25 plans declare an empty base class, so they would
		// all share one bucket and the scan would cost more than the merge it replaces.
		if (typeof first !== 'string' || first === '') {
			return mergeClassesWithPreset(clsx(userClass as never[]), presetClass, variantClass);
		}

		const bucket = merged.get(first);
		if (bucket) {
			// `user` first: it is the axis that discriminates within a bucket, and it bails on the
			// first differing element.
			for (const hit of bucket) {
				if (
					sameClass(hit.user, userClass) &&
					sameClass(hit.preset, presetClass) &&
					sameClass(hit.variant, variantClass)
				) {
					return hit.result;
				}
			}
		}

		const result = mergeClassesWithPreset(clsx(userClass as never[]), presetClass, variantClass);
		// Room is checked BEFORE the snapshot: building an entry only to drop it on a full bucket
		// would allocate four objects per call forever, on exactly the call sites hot enough to have
		// filled the bucket in the first place.
		const room = bucket === undefined || bucket.length < BUCKET_LIMIT;
		if (room && storable(userClass) && storable(presetClass) && storable(variantClass)) {
			const entry: MergedClass = {
				user: userClass.slice(),
				preset: Array.isArray(presetClass) ? presetClass.slice() : presetClass,
				variant: Array.isArray(variantClass) ? variantClass.slice() : variantClass,
				result
			};
			// ponytail: 512 keys, 8 per bucket. The bucket cap is the load-bearing one — a fixed first
			// class with a computed tail would otherwise grow one bucket without bound and scan it
			// linearly on every call. Raise either only against a profile.
			if (bucket === undefined) {
				if (merged.size >= KEY_LIMIT) merged.clear();
				merged.set(first, [entry]);
			} else {
				bucket.push(entry);
			}
		}
		return result;
	}

	return cn(presetClass, variantClass, userClass);
}
