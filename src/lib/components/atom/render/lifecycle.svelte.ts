import { untrack } from 'svelte';
import type { Bond } from '$ixirjs/ui/shared/bond';

// Lifecycle key prefix is retained for diagnostics only. Lifecycle identity is held in a
// global metadata registry; a symbol description is forgeable and must not define behavior.
const LIFECYCLE_PREFIX = '@ixirjs/lifecycle';

// Phase a symbol-keyed lifecycle callback fires at: `mount` (in DOM) or `destroy` (teardown).
// Both are client-only — Svelte's server rest_props drops symbol props during SSR. Init-time
// logic is no longer a symbol phase: use HtmlAtom's string-keyed `oninit` prop, which survives
// server rest_props and fires synchronously before mount on both server and client (see runLifecycle).
export type LifecycleType = 'mount' | 'destroy';

// A lifecycle callback: receives the atom's bond; `init`/`mount` may return a cleanup.
export type LifecycleAttachment<B extends Bond = Bond> = (bond?: B) => void | (() => void);

function buildKey(type: LifecycleType) {
	return [LIFECYCLE_PREFIX, type].join('/');
}

// Phantom brands carrying phase and bond type into the type system (no runtime value).
declare const phaseBrand: unique symbol;
declare const bondBrand: unique symbol;

// A lifecycle key with phase T and bond B in the type system; a symbol at runtime.
export type LifecycleKey<T extends LifecycleType = 'mount', B extends Bond = Bond> = symbol & {
	readonly [phaseBrand]: T;
	readonly [bondBrand]: B;
};

// Global metadata survives HMR and duplicate package copies while preserving each key's
// unforgeable identity. Symbol descriptions remain useful in diagnostics, never classification.
const LIFECYCLE_META = Symbol.for('@ixirjs/lifecycle/meta');
const MINTED_COUNT = Symbol.for('@ixirjs/lifecycle/minted-count');
// TypeScript's bundled WeakMap declaration has not yet caught up with runtimes that accept
// non-registered symbols as weak keys. Keep that compatibility boundary local and explicit.
type SymbolLifecycleMetadata = {
	get(key: symbol): LifecycleType | undefined;
	set(key: symbol, type: LifecycleType): void;
};
type LifecycleGlobal = {
	[LIFECYCLE_META]?: SymbolLifecycleMetadata;
	[MINTED_COUNT]?: number;
};
const GLOBAL = globalThis as LifecycleGlobal;

function lifecycleMeta(): SymbolLifecycleMetadata {
	return (GLOBAL[LIFECYCLE_META] ??= new WeakMap() as unknown as SymbolLifecycleMetadata);
}

export function createLifecycleKey<T extends LifecycleType = 'mount', B extends Bond = Bond>(
	type?: T
): LifecycleKey<T, B> {
	const lifecycleType = type ?? 'mount';
	const key = Symbol(buildKey(lifecycleType));
	lifecycleMeta().set(key, lifecycleType);
	bumpMintedCount();
	return key as LifecycleKey<T, B>;
}

// Minted-key count shares the same global lifetime as metadata, avoiding symbol scans until
// lifecycle support has actually been used.

function bumpMintedCount() {
	GLOBAL[MINTED_COUNT] = (GLOBAL[MINTED_COUNT] ?? 0) + 1;
}

// While false, no props object can carry a lifecycle key — classification skips the symbol scan.
function hasMintedKeys(): boolean {
	return (GLOBAL[MINTED_COUNT] ?? 0) > 0;
}

// The phase a lifecycle key fires at, or `undefined` if it wasn't minted by this protocol.
export function lifecycleType(key: symbol): LifecycleType | undefined {
	return lifecycleMeta().get(key);
}

// Whether a prop symbol is a lifecycle key (created by createLifecycleKey).
export function isLifecycleKey(key: symbol): boolean {
	return lifecycleType(key) !== undefined;
}

// All lifecycle callbacks of a props object, grouped by phase.
export type LifecycleProps<B extends Bond = Bond> = Record<LifecycleType, LifecycleAttachment<B>[]>;

const EMPTY_CALLBACKS = Object.freeze([]) as unknown as LifecycleAttachment[];

// Shared result for the no-callbacks case (vast majority of atoms) — avoids allocations per mount.
const NO_LIFECYCLE: LifecycleProps = Object.freeze({
	mount: EMPTY_CALLBACKS,
	destroy: EMPTY_CALLBACKS
});

// Collect every lifecycle callback from a props object, grouped by phase. One scan over the
// symbol keys; string keys and node-attachment symbols are ignored, non-function values skipped.
export function getLifecycleProps<B extends Bond = Bond>(
	props: Record<PropertyKey, unknown>
): LifecycleProps<B> {
	// No key minted yet → none can be in these props; skip even the symbol scan.
	if (!hasMintedKeys()) return NO_LIFECYCLE as LifecycleProps<B>;

	const symbols = Object.getOwnPropertySymbols(props);
	if (symbols.length === 0) return NO_LIFECYCLE as LifecycleProps<B>;

	const phases: LifecycleProps<B> = { mount: [], destroy: [] };
	let found = false;
	for (const key of symbols) {
		const type = lifecycleType(key);
		if (!type) continue;
		const fn = props[key];
		if (typeof fn !== 'function') continue;
		phases[type].push(fn as LifecycleAttachment<B>);
		found = true;
	}
	// Symbols present but none are lifecycle callbacks (e.g. node attachments).
	if (!found) return NO_LIFECYCLE as LifecycleProps<B>;
	return phases;
}

// Bond-level counterpart of `svelte/attachments`. Fires the bond lifecycle callbacks by phase.
// Lifecycle keys are symbol-keyed (description ≠ '@attach'), so Svelte ignores them on a DOM
// spread and SSR drops them entirely — nothing to strip; the live props flow on untouched.
// HtmlAtom is the sole caller.
export function runLifecycle<P extends Record<PropertyKey, unknown>, B extends Bond = Bond>(
	getProps: () => P,
	getBond: () => B | undefined,
	getOninit?: () => LifecycleAttachment<B> | undefined
): void {
	// Classify once — lifecycle keys are fixed at init, so this never re-runs per prop change.
	// The minted-key check comes first: `getProps()` is HtmlAtom's `effectiveRestProps`, which
	// materializes the Atom spread and merges it with rest props. Calling it before this guard
	// paid for a full merge per part only to discard it when no lifecycle key exists at all.
	const { mount, destroy } = hasMintedKeys()
		? getLifecycleProps<B>(getProps())
		: (NO_LIFECYCLE as LifecycleProps<B>);

	// `oninit` is the sole init hook (the symbol `init` phase was dropped). A plain string-keyed
	// prop, so it survives Svelte's server rest_props (which copies Object.keys() only) and fires
	// synchronously before mount on the server AND again on the client during hydration. The
	// callback must be idempotent; its returned cleanup is honored only on the client (no server
	// teardown). One-shot read — no reactive tracking.
	const oninit = getOninit?.();

	// Nothing to fire (the vast majority of atoms): skip the bond read and effect registration.
	if (!oninit && mount.length === 0 && destroy.length === 0) return;

	// `oninit` — fires once, synchronously, before mount; bond read untracked. Keep returned cleanup.
	const initialBond = untrack(getBond);
	const initCleanup = oninit?.(initialBond);
	const initCleanups = typeof initCleanup === 'function' ? [initCleanup] : [];

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
}

// Run the cleanups a phase's callbacks returned (each may return one, or nothing).
function runCleanups(cleanups: Array<void | (() => void)>) {
	for (const cleanup of cleanups) if (typeof cleanup === 'function') cleanup();
}
