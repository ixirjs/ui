import type { Motion, ResolvedMotion } from '$ixirjs/ui/preset';

export const MOTION_KEYS = ['initial', 'enter', 'exit', 'animate'] as const;

/**
 * The raw rich props Kernel can inspect before resolving presentation.
 */
export type MotionDeclaration = {
	motion?: unknown;
	defaults?: unknown;
	enter?: unknown;
	exit?: unknown;
};

type TransitionSource = { enter?: unknown; exit?: unknown } | undefined;
const hasTransition = (source: TransitionSource) => source?.enter != null || source?.exit != null;

/**
 * Whether these RAW props declare an enter/exit the four transition leaves can drive.
 *
 * The gate on `useElementMotion`, and the reason it reads raw props rather than the resolved
 * presentation: `useElementMotion` owns `$effect`s, which must be established during init and cannot
 * be created later, so the question has to be answerable at init. Reading `presentation.motion`
 * instead would force the browser's presentation `$derived` to resolve inside every part's
 * `<script>` rather than at its first template read — eager work for 100% of parts to answer a
 * question that matters to a handful. `render/resolve-count.svelte.spec.ts` is the canary for that,
 * with the caveat that it counts recomputes: an init-time read of a `$derived` neither adds a count
 * nor establishes a dependency, so it would stay at 1 and the regression would show only as µs.
 *
 * `defaults` counts as well as `motion`: it is the low-priority presentation layer a part uses to
 * declare its own motion while leaving a consumer's free to override — `accordion-item-body` is
 * exactly that shape. Reading only `motion` would leave every such part escalating. Top-level
 * `enter`/`exit` count too — `resolve/fold.ts` folds them out of rest props via `extractMotion`.
 *
 * Gated on `enter ?? exit`, not on "declares any motion": `animate`-only motion escalates to
 * `HtmlElement` regardless (see `render/render-mode.ts`), so gating on any key hands those parts a
 * rune whose effects can never fire — `popover-content.svelte` is exactly that shape.
 *
 * Deliberately not `extractMotion(props)`: this form allocates nothing, where `extractMotion`
 * returns a fresh object per part.
 *
 * KNOWN LIMIT: a transition declared by a PRESET rather than by the consumer escalates instead of
 * reaching a leaf, because detecting it needs the resolve this deliberately avoids. No preset in the
 * library ships motion today, so nothing regresses — but a preset that grows one will quietly take
 * the slower path until this gate learns to see it.
 */
export function declaresTransition(props: MotionDeclaration): boolean {
	return (
		hasTransition(props.motion as TransitionSource) ||
		hasTransition(props.defaults as TransitionSource) ||
		props.enter != null ||
		props.exit != null
	);
}

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
