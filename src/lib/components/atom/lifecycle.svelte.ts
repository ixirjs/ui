import { untrack } from 'svelte';
import type { Bond } from '$svelte-atoms/core/shared/bond.svelte';

// Lifecycle key prefix — namespaced so isLifecycleKey can identify them among other
// symbol-keyed props, and so the phase is recoverable from the symbol without a registry.
const LIFECYCLE_PREFIX = '@svelte-atoms/lifecycle:';

// Phase a lifecycle callback fires at: `init` (sync, before mount), `mount` (in DOM),
// `destroy` (teardown). Client-only — symbol props are dropped during SSR.
export type LifecycleType = 'init' | 'mount' | 'destroy';

// A lifecycle callback: receives the atom's bond; `init`/`mount` may return a cleanup.
export type LifecycleAttachment<B extends Bond = Bond> = (bond?: B) => void | (() => void);

function buildKey(type: LifecycleType) {
	return [LIFECYCLE_PREFIX, type].join('/');
}

// Phantom brands carrying phase and bond type into the type system (no runtime value).
declare const phaseBrand: unique symbol;
declare const bondBrand: unique symbol;

// A lifecycle key with phase T and bond B in the type system; a symbol at runtime. ADR 0005 D2.
export type LifecycleKey<T extends LifecycleType = 'init', B extends Bond = Bond> = symbol & {
	readonly [phaseBrand]: T;
	readonly [bondBrand]: B;
};

export function createLifecycleKey<T extends LifecycleType = 'init', B extends Bond = Bond>(
	type?: T
): LifecycleKey<T, B> {
	bumpMintedCount();
	const key = buildKey(type ?? 'init');
	return Symbol(key) as LifecycleKey<T, B>;
}

// Minted-key count on globalThis so it survives HMR reloads while consumers hold
// symbols minted by the previous module copy.
const MINTED_COUNT = Symbol.for('@svelte-atoms/lifecycle:minted-count');
const GLOBAL = globalThis as { [MINTED_COUNT]?: number };

function bumpMintedCount() {
	GLOBAL[MINTED_COUNT] = (GLOBAL[MINTED_COUNT] ?? 0) + 1;
}

// While false, no props object can carry a lifecycle key — classification skips the symbol scan.
function hasMintedKeys(): boolean {
	return (GLOBAL[MINTED_COUNT] ?? 0) > 0;
}

const LIFECYCLE_TYPES = ['init', 'mount', 'destroy'] as const satisfies readonly LifecycleType[];

// Description → phase map built once so lifecycleType (run per symbol prop) is an O(1) lookup.
const TYPE_BY_DESCRIPTION = new Map<string, LifecycleType>(
	LIFECYCLE_TYPES.map((type) => [buildKey(type), type])
);

// The phase a lifecycle key fires at, or `undefined` if it isn't one.
export function lifecycleType(key: symbol): LifecycleType | undefined {
	return key.description === undefined ? undefined : TYPE_BY_DESCRIPTION.get(key.description);
}

// Whether a prop symbol is a lifecycle key (created by createLifecycleKey).
export function isLifecycleKey(key: symbol): boolean {
	return lifecycleType(key) !== undefined;
}

// All lifecycle callbacks of a props object, grouped by phase.
export type LifecycleProps<B extends Bond = Bond> = Record<LifecycleType, LifecycleAttachment<B>[]>;

// What extractLifecycle produces: phase buckets plus the raw keys to strip.
type ExtractedLifecycle<B extends Bond = Bond> = { phases: LifecycleProps<B>; keys: symbol[] };

const EMPTY_CALLBACKS = Object.freeze([]) as unknown as LifecycleAttachment[];
const EMPTY_KEYS = Object.freeze([]) as unknown as symbol[];

// Shared result for the no-keys case (vast majority of atoms) — avoids allocations per mount.
const NO_LIFECYCLE: ExtractedLifecycle = Object.freeze({
	phases: Object.freeze({
		init: EMPTY_CALLBACKS,
		mount: EMPTY_CALLBACKS,
		destroy: EMPTY_CALLBACKS
	}),
	keys: EMPTY_KEYS
});

// Collect every lifecycle callback from a props object, grouped by phase. Non-functions skipped.
export function getLifecycleProps<B extends Bond = Bond>(
	props: Record<PropertyKey, unknown>
): LifecycleProps<B> {
	return extractLifecycle<B>(props).phases;
}

// One scan over symbol keys: groups callbacks by phase AND collects keys to strip
// (a symbol-fn prop on the DOM would otherwise be mistaken for a node attachment).
function extractLifecycle<B extends Bond = Bond>(
	props: Record<PropertyKey, unknown>
): ExtractedLifecycle<B> {
	// No key minted yet → none can be in these props; skip even the symbol scan.
	if (!hasMintedKeys()) return NO_LIFECYCLE as ExtractedLifecycle<B>;

	const symbols = Object.getOwnPropertySymbols(props);
	if (symbols.length === 0) return NO_LIFECYCLE as ExtractedLifecycle<B>;

	const phases: LifecycleProps<B> = { init: [], mount: [], destroy: [] };
	const keys: symbol[] = [];
	for (const key of symbols) {
		const type = lifecycleType(key);
		if (!type) continue;
		keys.push(key);
		const fn = props[key];
		if (typeof fn === 'function') phases[type].push(fn as LifecycleAttachment<B>);
	}
	// Symbols present but none are lifecycle keys (e.g. node attachments).
	if (keys.length === 0) return NO_LIFECYCLE as ExtractedLifecycle<B>;
	return { phases, keys };
}

// Pick one phase's callbacks out of a grouped LifecycleProps.
export function getLifecyclePropsByType<B extends Bond = Bond>(
	type: LifecycleType,
	props: LifecycleProps<B>
): LifecycleAttachment<B>[] {
	return props[type];
}

// What runLifecycle hands back to the renderer.
export interface LifecycleRunner<P> {
	// props with every lifecycle key stripped — safe to spread onto the DOM.
	readonly rest: P;
}

// Bond-level counterpart of `svelte/attachments`. Fires lifecycle callbacks by phase,
// strips their keys from props before the DOM sees them. HtmlAtom is the sole caller.
export function runLifecycle<P extends Record<PropertyKey, unknown>, B extends Bond = Bond>(
	getProps: () => P,
	getBond: () => B | undefined
): LifecycleRunner<P> {
	// Classify once — lifecycle keys are fixed at init, so this never re-runs per prop change.
	const { phases, keys } = extractLifecycle<B>(getProps());

	// Fast path — no lifecycle keys: pass the live props straight through. Keeps identity
	// stable and per-prop tracking intact (a copy would re-materialize on any prop change
	// and invalidate every consumer wholesale).
	if (keys.length === 0) {
		return {
			get rest() {
				return getProps();
			}
		};
	}

	const { init, mount, destroy } = phases;

	// `init` — fires once, synchronously, before mount; bond read untracked. Keep returned cleanups.
	const initialBond = untrack(getBond);
	const initCleanups = init
		.map((fn) => fn(initialBond))
		.filter((cleanup): cleanup is () => void => typeof cleanup === 'function');

	// `mount` — just before the element is committed to the DOM. Callbacks run untracked so
	// state they read can't re-fire the hooks; only the bond read is tracked.
	if (mount.length > 0) {
		$effect.pre(() => {
			const bond = getBond();
			const cleanups = untrack(() => mount.map((fn) => fn(bond)));
			return () => runCleanups(cleanups);
		});
	}

	// teardown — run the init cleanups, then the `destroy` hooks.
	if (initCleanups.length > 0 || destroy.length > 0) {
		$effect(() => {
			return () => {
				for (const cleanup of initCleanups) cleanup();
				for (const fn of destroy) fn();
			};
		});
	}

	// ≤3 keys: a linear scan beats a Set, and `typeof` short-circuits string keys.
	const isStripped = (key: PropertyKey) => typeof key === 'symbol' && keys.includes(key);

	// `rest` — one stable filtering view, never a copy: reads forward to the live props with
	// the lifecycle keys hidden. Same contract as the fast path — stable identity, fine-grained
	// tracking, nothing allocated per prop change.
	const rest = new Proxy({} as Record<PropertyKey, unknown>, {
		get: (_, key) => (isStripped(key) ? undefined : getProps()[key]),
		has: (_, key) => (isStripped(key) ? false : key in getProps()),
		ownKeys: () => Reflect.ownKeys(getProps()).filter((key) => !isStripped(key)),
		// Forwarded descriptors are configurable, as the proxy invariant requires for keys
		// absent from the dummy target.
		getOwnPropertyDescriptor: (_, key) =>
			isStripped(key) ? undefined : Reflect.getOwnPropertyDescriptor(getProps(), key)
	}) as P;

	return {
		get rest() {
			return rest;
		}
	};
}

// Run the cleanups a phase's callbacks returned (each may return one, or nothing).
function runCleanups(cleanups: Array<void | (() => void)>) {
	for (const cleanup of cleanups) if (typeof cleanup === 'function') cleanup();
}
