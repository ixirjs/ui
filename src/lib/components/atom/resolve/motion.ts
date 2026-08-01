import type { Motion, ResolvedMotion } from '$ixirjs/ui/preset';

export const MOTION_KEYS = ['initial', 'enter', 'exit', 'animate'] as const;

/** Reads nested motion first, falling back to legacy flat phase props when a phase is undefined. */
export function extractMotion(
	layer: Record<string, unknown> | undefined
): Motion | null | undefined {
	if (!layer) return undefined;
	if (
		!('motion' in layer) &&
		!('initial' in layer) &&
		!('enter' in layer) &&
		!('exit' in layer) &&
		!('animate' in layer)
	) {
		return undefined;
	}
	const nested = layer.motion;
	if (nested === null) return null;

	const nestedRecord =
		typeof nested === 'object' && nested !== null ? (nested as Record<string, unknown>) : undefined;
	const result: Motion = {};
	let found = false;
	for (const key of MOTION_KEYS) {
		const nestedValue =
			nestedRecord && Object.hasOwn(nestedRecord, key) ? nestedRecord[key] : undefined;
		const value = nestedValue === undefined ? layer[key] : nestedValue;
		if (value === undefined) continue;
		(result as Record<string, unknown>)[key] = value;
		found = true;
	}
	return found ? result : undefined;
}

/** Merges raw motion configuration while preserving null disable sentinels. */
export function mergeMotionConfig(
	base: Motion | null | undefined,
	next: Motion | null | undefined
): Motion | null | undefined {
	if (next === undefined) return base;
	if (next === null) return null;

	const result: Motion = {};
	if (base === null) {
		for (const key of MOTION_KEYS) result[key] = null;
	} else if (base) {
		for (const key of MOTION_KEYS) {
			if (Object.hasOwn(base, key) && base[key] !== undefined) {
				(result as Record<string, unknown>)[key] = base[key];
			}
		}
	}

	for (const key of MOTION_KEYS) {
		if (Object.hasOwn(next, key) && next[key] !== undefined) {
			(result as Record<string, unknown>)[key] = next[key];
		}
	}
	return result;
}

/** Resolves the cascade to renderer-ready phases: undefined inherits and null removes. */
export const EMPTY_RESOLVED_MOTION: ResolvedMotion<Element> = Object.freeze({});

export function resolveMotionLayers<E extends Element = Element>(
	layers: readonly (Motion | Motion<E> | null | undefined)[]
): ResolvedMotion<E> {
	let merged: Motion | null | undefined;
	for (const layer of layers)
		merged = mergeMotionConfig(merged, layer as Motion | null | undefined);
	if (!merged) return EMPTY_RESOLVED_MOTION as ResolvedMotion<E>;

	const resolved: Record<string, unknown> = {};
	if (merged !== null) {
		for (const key of MOTION_KEYS) {
			const value = merged[key];
			if (value !== undefined && value !== null) resolved[key] = value;
		}
	}
	return resolved as ResolvedMotion<E>;
}
