/**
 * `Kernel` — the element seam, redesigned around what a written part needs.
 *
 * The same `Kernel.xxx` surface, a different contract underneath. The previous Kernel *discovered*
 * what a part was — plan, node, two lanes, an Atom to project capabilities onto, a registry to
 * find it by role — and paid for that discovery per part per render (30 frames, 14–18 objects
 * for one attribute object; `docs/research/whiteboard-2026-08.md`). This one is handed the facts:
 * the preset key, the base class, the part's own attributes and handlers, and — only when a part
 * has a reason — a renderer or motion. It keeps everything a consumer can observe:
 *
 * - presentation precedence `preset → variants → consumer class`, tailwind-merged, `$preset`, the
 *   default border, the memo;
 * - attribute merge semantics: the consumer's handler composes with the part's (consumer first,
 *   part skipped on `defaultPrevented`), `class`/`style`/aria token lists merge;
 * - the render leaves for a part that needs them — transition leaves, `HtmlElement` for a driver,
 *   a custom renderer through `base` — at the same hydration-anchor cost as before;
 * - DEV diagnostics on the merge.
 *
 * A plain part spreads `el.attrs` on its own literal tag. A rich part binds its leaf ONCE in the
 * script and renders it by name:
 *
 *     const leaf = Kernel.render(el);
 *     {@render leaf(el, children)}
 *
 * The identifier form compiles to a direct call on both platforms — no snippet block, no branch,
 * no hydration anchor. The inline `{@render Kernel.render(el)(…)}` form is a `snippet()` block
 * with an anchor, because the compiler must assume a call expression can change. The leaf is
 * decided once at init anyway (tag, renderer, motion), so binding it once loses nothing and
 * makes a dispatching part cost exactly what a literal one does.
 */
import { getContext, setContext, untrack } from 'svelte';
import { BROWSER, DEV } from 'esm-env';
import type { ClassValue } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type {
	Motion,
	Preset,
	PresetEntry,
	PresetEntryRecord,
	PresetLike,
	PresetModuleName,
	PresetRender
} from '$ixirjs/ui/preset';
import { getPreset } from '$ixirjs/ui/preset/context.svelte';
import { HtmlElement } from '$ixirjs/ui/components/element';
import {
	useElementMotion,
	type ElementMotion
} from '$ixirjs/ui/components/element/use-element-motion.svelte';
import { mergeSpreadProps, composeHandlers, EMPTY as EMPTY_SHARED } from '$ixirjs/ui/kernel/merge';
import {
	mergeClassesWithPreset,
	mergePresetClasses,
	withConsumerClass,
	containsPlaceholder
} from './resolve/classes';
import { resolvePreset as toRecord } from './resolve/preset';
import { mergeVariants, resolveLocalVariants } from './resolve/variants';
import { resolveConsumedVariantKeys, resolvePresetLayer } from './resolve/resolvers';
import { simpleRecord } from './resolve/default-record';
import { MOTION_SKIP, VARIANTS_SKIP } from './resolve/constants';
import { renderMode, type RenderMode } from './render/render-mode';
import { KERNEL_PROP_NAMES } from './render/kernel-props';
import {
	resolveRendererComponent,
	resolveRendererProps,
	resolveRenderTarget
} from './render/render-target';
import SnippetAdapter from './snippet.svelte';
import { branchForMode } from './element-render.svelte';
import type { ElementBody } from './render/element-branches.svelte';
import type { LeafAttrs } from './types';

// ─── Element ───────────────────────────────────────────────────────────────────────────────────

export type ElementSpec = {
	/** Preset key this part resolves under (`'card.header'`); omitted, only a consumer `preset` applies. */
	preset?: PresetModuleName | undefined;
	/** The part's base classes. `border-border` is supplied when nothing sets a border. */
	class: string;
	/**
	 * The tag, for `Kernel.render`, decided once at init. A string is the part's own; a THUNK —
	 * `as: () => props.as` — lets the consumer choose (their `as`, else the preset's `render.as`,
	 * else the part's own). `div`/`h3`/`button` take a literal leaf, any other tag the
	 * `<svelte:element>` leaf (+2 hydration anchors). A literal-element part does not need either.
	 */
	as?: string | (() => string | undefined);
	/**
	 * The part's OWN attributes and handlers. A THUNK is read inside the memo, so state reads are
	 * tracked (the datagrid cell, whose attrs depend on a per-instance Bond read). A plain object —
	 * `{ role: 'gridcell' }` — is a part that owns no state to track; it is used as-is, with no
	 * client `$derived` wrapping it.
	 */
	attrs?: Record<string, unknown> | (() => Record<string, unknown>);
	/**
	 * Handed to function-form preset entries and variant resolvers. A `KernelContext<T>` HANDLE
	 * (what `Kernel.context()` returns) is resolved lazily: `.get()` is called at init only if
	 * something will actually read the Bond (a function-form preset entry, a layer, variantProps,
	 * preset variants/compounds, a consumer `variants`/`preset` prop, or `oninit`) — see
	 * `resolveState`. A part whose only use of the Bond was `state: XContext.get()` can pass the
	 * handle itself and skip the context read entirely (L4).
	 */
	state?: unknown | KernelContext<unknown>;
	/** Props that select preset variants without reaching the DOM. */
	variantProps?: () => Record<string, unknown>;
	/** A per-instance preset layer (`presets.root` on a root): its `class` and `attrs` apply after the preset. */
	layer?: () => PresetLike | undefined;
	/** A renderer to escalate to (`base`); the part then renders through `Kernel.render`. */
	base?: () => unknown;
	/** Transitions or an `animate` driver; the part then renders through `Kernel.render`. */
	motion?: () => Motion<never> | null | undefined;
};

export type KernelElement = {
	/**
	 * Every attribute the element spreads, `class` included. One memoized object per resolution.
	 * Typed as `LeafAttrs` so a literal tag accepts it (an element spread carrying attachment symbols
	 * must type every symbol-keyed value as an attachment).
	 */
	readonly attrs: LeafAttrs;
	// The view a render leaf reads — the same contract the leaves already have.
	tag(): string;
	spread(): Record<string | symbol, unknown>;
	class(): string;
	/** Attributes without `class` — what the escalation leaves hand a renderer. */
	attributes(): Record<string | symbol, unknown>;
	motion(): ElementMotion<never> | undefined;
	resolvedMotion(): object;
	renderer(): { component: unknown; props: Record<string, unknown> };
	mode(): RenderMode;
};

const NO_MOTION: object = Object.freeze({});
const USER_LAYER = Object.freeze({ nextIsUser: true });

/** Private brand on the object `Kernel.context()` returns — how `resolveState` tells a context
 * HANDLE apart from a Bond passed directly, without duck-typing on `.get`. */
const KERNEL_CONTEXT = Symbol('kernel-context-handle');
function isKernelContextHandle(value: unknown): value is KernelContext<unknown> {
	return typeof value === 'object' && value !== null && (value as never)[KERNEL_CONTEXT] === true;
}

/**
 * L4: a context handle in `spec.state` costs a `getContext` only when something will read it.
 * `needsState` is decided once at init from facts already known then (see `element()`); a static
 * preset entry with no layer/variantProps/variants/consumer-variants/live-preset/oninit never
 * touches context, so a part like `Card.Header` (`state: CardContext`) makes zero context reads.
 */
function resolveState(spec: ElementSpec, needsState: boolean): unknown {
	const raw = spec.state;
	return isKernelContextHandle(raw) ? (needsState ? raw.get() : undefined) : raw;
}

/**
 * The consumer's element attributes: everything that is not a Kernel prop and not a variant
 * selector (`tone="hot"` selects a class; it is not an attribute). `class` is merged apart.
 */
function consumerAttrs(
	props: Record<string, unknown>,
	consumed: ReadonlySet<string> | undefined
): Record<string | symbol, unknown> {
	// ONE `Reflect.ownKeys`, not a `for…in` plus `Object.getOwnPropertySymbols`. Both walk a props
	// PROXY, whose `ownKeys` trap is not free: it was 7.1% of self time on the broad-update profile
	// (`bench-vs-profile --broad`, §18) and this function 20%, on a change that only touches `class`.
	// `Reflect.ownKeys` returns strings and symbols in one pass and keeps the same order.
	let out: Record<string | symbol, unknown> | undefined;
	if (!BROWSER) {
		// The server's `rest_props` is a plain object, and symbol-keyed props (attachments) never
		// render there, so `for…in` walks it with no key array at all.
		for (const key in props) {
			if (KERNEL_PROP_NAMES.has(key) || consumed?.has(key)) {
				if (key !== 'part' || typeof props[key] !== 'string') continue;
			}
			(out ??= {})[key] = props[key];
		}
		return out ?? EMPTY_SHARED;
	}
	for (const key of Reflect.ownKeys(props)) {
		if (typeof key === 'symbol') {
			(out ??= {})[key as unknown as string] = (props as Record<symbol, unknown>)[key];
			continue;
		}
		if (KERNEL_PROP_NAMES.has(key) || consumed?.has(key)) {
			// `part` is the one Kernel prop that is ALSO an HTML attribute (CSS shadow parts). A
			// string is the attribute and is forwarded unchanged; anything else is the seam's own.
			if (key !== 'part' || typeof props[key] !== 'string') continue;
		}
		(out ??= {})[key] = props[key];
	}
	return out ?? EMPTY_SHARED;
}

/**
 * The DOM attributes a resolved variant publishes (`{ class: 'is-primary', 'data-variant': 'primary' }`).
 * `resolveVariants` spreads them flat beside `class`/`motion`, so they are lifted by exclusion — the
 * same skip sets `fold.ts` applies on the old lane. `undefined` when the variant set none.
 */
function variantAttributes(variant: Record<string, unknown>): Record<string, unknown> | undefined {
	let out: Record<string, unknown> | undefined;
	for (const key in variant) {
		if (VARIANTS_SKIP.has(key) || MOTION_SKIP.has(key)) continue;
		(out ??= {})[key] = variant[key];
	}
	return out;
}

// ─── Module-level caches (L6) ──────────────────────────────────────────────────────────────────
//
// A component instance lives for one render on the server, so every closure `element()` allocated
// per part — `entryFor`, `staticRecord`, `resolve`, `ownMerged`, the init-scan closure, the
// `ownAttrs` wrapper — was garbage immediately (GC was 30% of the SSR CPU profile on card-direct).
// These caches and the module-level helpers below let `element()` allocate one `Handle` (plus, on
// the client, its `$derived`s) instead of a closure per field.

/** `staticBase` (L1's frozen `{class, ...attrs}` reference) shared across every instance AND every
 * render for one (preset record, part base class) pair. Keyed on the record's identity — the
 * shipped `defaultPreset` factories return a reference-stable record — then on `spec.class`, a
 * module literal string. A function entry that yields a fresh record each call simply misses the
 * `WeakMap` and falls back to allocating, same as before this cache existed. */
const staticBaseCache = new WeakMap<
	PresetEntryRecord,
	Map<string, Record<string | symbol, unknown>>
>();
/** `userBase` (`[spec.class, '$preset']`) shared across every instance built from the same call
 * site. Bounded so a pathological caller minting fresh `spec.class` strings can't grow it forever
 * — on overflow it just allocates, same as before. */
const USER_BASE_CACHE_LIMIT = 512;
const userBaseCache = new Map<string, readonly string[]>();

function getUserBase(klass: string): readonly string[] {
	const hit = userBaseCache.get(klass);
	if (hit) return hit;
	const built: readonly string[] = [klass, '$preset'];
	if (userBaseCache.size < USER_BASE_CACHE_LIMIT) userBaseCache.set(klass, built);
	return built;
}

function getStaticBase(
	recordValue: PresetEntryRecord,
	klass: string,
	userBase: readonly string[]
): Record<string | symbol, unknown> {
	let byClass = staticBaseCache.get(recordValue);
	if (!byClass) staticBaseCache.set(recordValue, (byClass = new Map()));
	const hit = byClass.get(klass);
	if (hit) return hit;
	const built = Object.freeze({
		class: mergePresetClasses(userBase, recordValue.class, undefined, true),
		...(recordValue.attrs as Record<string, unknown> | undefined)
	});
	byClass.set(klass, built);
	return built;
}

/** Hoisted from a per-`element()`-call closure: no captured `installed`, called with it instead. */
function entryFor(
	installed: Partial<Preset> | undefined,
	key: PresetModuleName | undefined
): PresetEntry | undefined {
	return key === undefined ? undefined : installed?.[key];
}

function staticRecordFor(
	key: PresetModuleName | undefined,
	entry: PresetEntry | undefined
): PresetEntryRecord | undefined {
	return entry === undefined || key === undefined
		? undefined
		: typeof entry !== 'function'
			? toRecord(entry)
			: simpleRecord(entry, key);
}

/** What the init-time key scan answers, whichever iteration strategy produced it. */
type InitFlags = {
	oninit: boolean;
	motionKey: boolean;
	variantsProp: boolean;
	livePreset: boolean;
};

function scanFlags(
	oninit: boolean,
	motionKey: boolean,
	variantsProp: boolean,
	livePreset: boolean
) {
	return { oninit, motionKey, variantsProp, livePreset };
}

/** Server: `props()` is a plain object (`rest_props` in `svelte/internal/server`), so a `for…in`
 * needs no proxy `ownKeys` trap — cheaper than `Reflect.ownKeys` for the same answer. */
function scanInitKeysPlain(obj: Record<string, unknown>): InitFlags {
	let oninit = false,
		motionKey = false,
		variantsProp = false,
		livePreset = false;
	for (const key in obj) {
		if (key === 'oninit') oninit = true;
		else if (
			key === 'motion' ||
			key === 'initial' ||
			key === 'enter' ||
			key === 'exit' ||
			key === 'animate'
		)
			motionKey = true;
		else if (key === 'variants') variantsProp = true;
		else if (key === 'preset') livePreset = true;
	}
	return scanFlags(oninit, motionKey, variantsProp, livePreset);
}

/** Client: `props()` is a proxy, so ONE `Reflect.ownKeys` (strings and symbols in one pass, same
 * order) beats a `for…in` plus `Object.getOwnPropertySymbols`. */
function scanInitKeysProxy(obj: Record<string | symbol, unknown>): InitFlags {
	let oninit = false,
		motionKey = false,
		variantsProp = false,
		livePreset = false;
	for (const key of Reflect.ownKeys(obj)) {
		if (key === 'oninit') oninit = true;
		else if (
			key === 'motion' ||
			key === 'initial' ||
			key === 'enter' ||
			key === 'exit' ||
			key === 'animate'
		)
			motionKey = true;
		else if (key === 'variants') variantsProp = true;
		else if (key === 'preset') livePreset = true;
	}
	return scanFlags(oninit, motionKey, variantsProp, livePreset);
}

/** 0 = no own attrs, 1 = constant object, 2 = thunk (reads Bond state). */
type OwnAttrsKind = 0 | 1 | 2;

function element(props: () => Record<string, unknown>, spec: ElementSpec): KernelElement {
	// Preset installation is initialization-scoped: read once, like every caller before this one.
	const installed: Partial<Preset> | undefined = getPreset();

	// Array form, hoisted and now shared module-wide per `spec.class`: `mergeClassesWithPreset`
	// memoises only a flat string array keyed on its first element.
	const userBase = getUserBase(spec.class);

	// The part's own attrs — a THUNK reads Bond state, not consumer props, so on the client it gets
	// its own $derived, held on the Handle; a plain object needs no wrapping at all (point 4).
	let ownAttrsKind: OwnAttrsKind = 0;
	let ownAttrsValue: Record<string, unknown> | (() => Record<string, unknown>) | undefined;
	if (typeof spec.attrs === 'function') {
		ownAttrsKind = 2;
		ownAttrsValue = spec.attrs;
	} else if (spec.attrs) {
		ownAttrsKind = 1;
		ownAttrsValue = spec.attrs;
	}

	// ONE key scan at init: answers whether `oninit`, any motion key, a consumer `variants` or a
	// live `preset` prop were ever passed. Untracked only on the client, where `props()` is a proxy
	// and the untrack call earns its closure; on the server `untrack` is trivial but its closure is
	// not, so the plain-object scan runs directly.
	const flags = BROWSER ? untrack(() => scanInitKeysProxy(props())) : scanInitKeysPlain(props());

	// A preset's `render` is structural — which tag, which renderer — and is read once, at init, the
	// way the lane always was. It reaches the DOM only through `Kernel.render`: a part that spreads
	// `el.attrs` on a literal tag cannot honour it, and DEV says so once per key.
	const initialEntry = entryFor(installed, spec.preset);
	const staticRecordValue = staticRecordFor(spec.preset, initialEntry);
	// L4: whether anything will actually read `state` this init. A context HANDLE in `spec.state`
	// only pays its `getContext` when one of these is true; a plain value (most Bonds still passed
	// directly) is unaffected either way.
	// `typeof initialEntry === 'function'` is true for every shipped `defaultPreset` entry too (the
	// `entry(...)` factory always returns a function) — but `simpleRecord` already resolved those
	// WITHOUT reading state (`EMPTY_CONTEXT`, cached by identity). Only a genuine function entry
	// that `simpleRecord` could NOT statically resolve — `staticRecordValue === undefined` — is
	// actually about to be called with `{ bond: state }` below, so only THAT case needs the Bond.
	const needsState =
		(staticRecordValue === undefined && typeof initialEntry === 'function') ||
		!!spec.layer ||
		!!spec.variantProps ||
		!!staticRecordValue?.variants ||
		!!staticRecordValue?.compounds ||
		flags.variantsProp ||
		flags.livePreset ||
		flags.oninit;
	const state = resolveState(spec, needsState);
	const initialRecord =
		staticRecordValue ??
		(typeof initialEntry === 'function'
			? toRecord(initialEntry({ bond: state } as never))
			: undefined);
	// L1: a static preset entry — resolved once above, from a non-function entry or a cached
	// `simpleRecord` hit, never a fresh call — with no layer, no `variantProps`, and no
	// variants/compounds of its OWN (a consumer-local `variants` prop still routes through the
	// generic branch inside `#resolve()`, checked there since it can change reactively). `#resolve()`
	// reuses `staticRecordValue` instead of probing the registry a second time.
	const staticEntry =
		staticRecordValue !== undefined &&
		!spec.layer &&
		!spec.variantProps &&
		!staticRecordValue.variants &&
		!staticRecordValue.compounds;
	// Precomputed once PER (record, base class) PAIR, shared module-wide (L6): the exact attrs
	// object a static part resolves to when the consumer passes no class, no `defaults` and the part
	// has no own attrs — `#resolve()` hands this back BY REFERENCE, so the common part (a card
	// header, a badge) allocates nothing per resolution, and every instance of that part shares one.
	const staticBase: Record<string | symbol, unknown> | undefined = staticEntry
		? getStaticBase(staticRecordValue!, spec.class, userBase)
		: undefined;
	const presetRender = initialRecord?.render;
	if (DEV && presetRender && spec.as === undefined && spec.base === undefined) {
		warnLiteralRender(spec.preset!);
	}

	// `oninit`: the string-keyed hook that survives server `rest_props`, so it fires synchronously
	// pre-mount on the server AND again on client hydration — keep it idempotent. Read untracked and
	// run here, during init, which is where the part is built; the returned cleanup runs on client
	// teardown only. Symbol-keyed lifecycle keys are gone with the old runtime.
	const oninit = flags.oninit
		? (untrack(() => props().oninit) as ((state?: unknown) => void | (() => void)) | undefined)
		: undefined;
	if (oninit) {
		const cleanup = oninit(state);
		if (BROWSER && typeof cleanup === 'function') $effect(() => cleanup);
	}

	// Motion a CONSUMER passed, for a part that declares none of its own: `motion`, or the four
	// phase props spelled separately. Allocated only when the ownKeys pass above actually saw one of
	// those keys — most parts never do. Read raw and untracked at init — reading a resolved
	// presentation here would make every part resolve eagerly (`resolve-count` cannot see that,
	// because an init-time read of a `$derived` neither counts nor subscribes).
	const consumerMotion = flags.motionKey
		? (): unknown => {
				const p = props();
				if (p.motion) return p.motion;
				if (p.initial || p.enter || p.exit || p.animate) {
					return { initial: p.initial, enter: p.enter, exit: p.exit, animate: p.animate };
				}
				return undefined;
			}
		: undefined;
	// A preset may declare the motion itself (`record.motion`), and a part that names no motion of
	// its own still owes it — that is how a themed button animates without every call site saying so.
	// Structural, like `render`: read from the init record, not re-read per resolve.
	const presetMotion = initialRecord?.motion;
	// A part that writes `motion: () => motion ?? defaults` declares the thunk unconditionally, so
	// "declared" is what the thunk YIELDS at init, not whether it exists — otherwise such a part
	// would shadow the consumer's own motion and the preset's with its own `undefined`.
	const declaredMotion =
		spec.motion && untrack(() => spec.motion?.() != null) ? spec.motion : undefined;
	const specMotion: ElementSpec['motion'] =
		declaredMotion ??
		(consumerMotion && untrack(() => consumerMotion() !== undefined)
			? (consumerMotion as NonNullable<ElementSpec['motion']>)
			: presetMotion
				? ((() => presetMotion) as NonNullable<ElementSpec['motion']>)
				: undefined);
	const effectiveSpec: ElementSpec =
		specMotion === spec.motion ? spec : ({ ...spec, motion: specMotion } as ElementSpec);

	let motionRune: ElementMotion<never> | undefined;
	if (specMotion) {
		motionRune = useElementMotion<never>({
			motion: () => (specMotion() ?? undefined) as never,
			onmount: () => props().onmount as never,
			ondestroy: () => props().ondestroy as never,
			onintroend: () => props().onintroend as never,
			onexitend: () => props().onexitend as never,
			once: true
		});
	}

	// One allocation per part: everything else — `#resolve`, `#ownMerged`, the per-part fields — now
	// lives on the Handle instance instead of a fresh closure each.
	return new Handle(
		props,
		effectiveSpec,
		installed,
		state,
		staticRecordValue,
		staticEntry,
		staticBase,
		userBase,
		ownAttrsKind,
		ownAttrsValue,
		motionRune,
		presetRender
	);
}

class Handle implements KernelElement {
	readonly #props: () => Record<string, unknown>;
	readonly #spec: ElementSpec;
	readonly #installed: Partial<Preset> | undefined;
	readonly #state: unknown;
	readonly #staticRecordValue: PresetEntryRecord | undefined;
	readonly #staticEntry: boolean;
	readonly #staticBase: Record<string | symbol, unknown> | undefined;
	readonly #userBase: readonly string[];

	readonly #ownAttrsKind: OwnAttrsKind;
	readonly #ownAttrsConstant: Record<string, unknown> | undefined;
	readonly #ownAttrsThunk: (() => Record<string, unknown>) | undefined;
	readonly #ownAttrsMemo: (() => Record<string, unknown>) | undefined;
	#ownMergedCache: Map<string, string> | undefined;

	readonly #motion: ElementMotion<never> | undefined;
	readonly #tag: string;
	/** The preset's `render.as`, when it declared one — the fallback for a part's own `as`. */
	readonly #fallbackTag: string;
	readonly #presetBase: unknown;
	#mode: RenderMode | undefined;

	readonly #attrsFn: () => Record<string | symbol, unknown>;
	#once: Record<string | symbol, unknown> | undefined;

	constructor(
		props: () => Record<string, unknown>,
		spec: ElementSpec,
		installed: Partial<Preset> | undefined,
		state: unknown,
		staticRecordValue: PresetEntryRecord | undefined,
		staticEntry: boolean,
		staticBase: Record<string | symbol, unknown> | undefined,
		userBase: readonly string[],
		ownAttrsKind: OwnAttrsKind,
		ownAttrsValue: Record<string, unknown> | (() => Record<string, unknown>) | undefined,
		motion: ElementMotion<never> | undefined,
		presetRender: PresetRender | undefined
	) {
		this.#props = props;
		this.#spec = spec;
		this.#installed = installed;
		this.#state = state;
		this.#staticRecordValue = staticRecordValue;
		this.#staticEntry = staticEntry;
		this.#staticBase = staticBase;
		this.#userBase = userBase;

		this.#ownAttrsKind = ownAttrsKind;
		if (ownAttrsKind === 1) {
			this.#ownAttrsConstant = ownAttrsValue as Record<string, unknown>;
		} else if (ownAttrsKind === 2) {
			const thunk = ownAttrsValue as () => Record<string, unknown>;
			// A consumer-prop change (the broad `class` update) re-reads this cached object instead of
			// re-running the Bond reads — the thunk was 5.4% (card) / 8.1% (table) of the broad-update
			// profile. On the server the thunk runs once per render anyway, so it needs no memo.
			if (BROWSER) {
				const memo = $derived.by(thunk);
				this.#ownAttrsMemo = () => memo;
			} else {
				this.#ownAttrsThunk = thunk;
			}
		}

		this.#motion = motion;
		this.#fallbackTag = presetRender?.as ?? (typeof spec.as === 'string' ? spec.as : 'div');
		// The tag is decided ONCE, at init — the same rule the lane always had. A consumer's `as`
		// (read here, at init) wins over the preset's `render.as`, which wins over the part's own; the
		// result is a fixed string, so `div`/`h3`/`button` take their literal leaf and anything else
		// the dynamic one. An `as` that changes after init is not honoured; nothing in the repo does.
		this.#tag =
			typeof spec.as === 'function' ? (spec.as() ?? this.#fallbackTag) : this.#fallbackTag;
		this.#presetBase = presetRender?.base;

		// ONE memo, deliberately (unchanged from the prior lane). On the server the resolution runs
		// once and is cached lazily — most parts never read `.attrs` more than once per render, and a
		// part that does (attrs + attributes + class) shares the one computation.
		if (BROWSER) {
			const memo = $derived.by(() => this.#resolve());
			this.#attrsFn = () => memo;
		} else {
			this.#attrsFn = () => (this.#once ??= this.#resolve());
		}
	}

	#ownAttrs(): Record<string, unknown> | undefined {
		if (this.#ownAttrsKind === 0) return undefined;
		if (this.#ownAttrsKind === 1) return this.#ownAttrsConstant;
		return this.#ownAttrsMemo ? this.#ownAttrsMemo() : this.#ownAttrsThunk!();
	}

	// An own state class merged onto the static base, cached per distinct value on this instance.
	// A part cycles through a handful of these (selected / not, disabled / not); the cap keeps a
	// pathological computed class from growing the map.
	#ownMerged(ownClass: string): string {
		let hit = this.#ownMergedCache?.get(ownClass);
		if (hit !== undefined) return hit;
		hit = mergePresetClasses(
			[this.#spec.class, ownClass, '$preset'],
			this.#staticRecordValue!.class,
			undefined,
			true
		);
		if ((this.#ownMergedCache ??= new Map()).size < 8) this.#ownMergedCache.set(ownClass, hit);
		return hit;
	}

	// Splitting the expensive half (preset, variants, `tailwind-merge`) from the cheap merge was
	// tried on 2026-08-27 to stop an unrelated attribute change from re-resolving classes — and
	// MEASURED WORSE: card broad update 8.3 → 9.2 µs, card-direct 4.9 → 8.5, mount +1.5 on both. A
	// broad update changes `class`, so the expensive half re-runs anyway, and the split adds a second
	// signal and a wrapper object per part. See §18 of perf-vs-shadcn-2026-08.md.
	#resolve(): Record<string | symbol, unknown> {
		const spec = this.#spec;
		const state = this.#state;
		const consumer = this.#props();
		const key = (typeof consumer.preset === 'string' ? consumer.preset : spec.preset) as
			| PresetModuleName
			| undefined;
		// The static fast path only applies while the consumer hasn't rerouted the preset key —
		// `staticEntry` was classified against `spec.preset`, so a live `preset` prop (rare; only a
		// generic seam probe exercises it) falls straight through to the generic branch below.
		const useStatic = this.#staticEntry && key === spec.preset;
		let record: PresetEntryRecord | undefined;
		if (useStatic) {
			record = this.#staticRecordValue;
		} else {
			const entry = entryFor(this.#installed, key);
			// Class-only default entries resolve once per entry; a function entry that may read state
			// resolves inside the memo so its reads are tracked.
			record =
				staticRecordFor(key, entry) ??
				(typeof entry === 'function' ? toRecord(entry({ bond: state } as never)) : undefined);
		}
		let own = this.#ownAttrs();
		// The static lane (L1/L2): a static entry with no consumer `variants`/`defaults`. Everything a
		// part can still vary here — its own attrs, an own state class, the consumer's class — is
		// layered onto `staticBase` without touching the variant/layer machinery below:
		//   - nothing varies → `staticBase` BY REFERENCE (zero allocation);
		//   - an own state class → merged once per distinct value per instance (`#ownMerged`), so a
		//     row toggling `selected` never re-runs tailwind-merge;
		//   - a consumer class → one `withConsumerClass` on top (shadcn's own `cn()` cost).
		// A consumer class carrying its own `$preset` sentinel, or a non-string own class, still
		// needs the array merge and falls through. Key order matches the generic build exactly:
		// `class`, preset attrs, then the part's own keys minus `class`.
		if (useStatic && consumer.variants === undefined && consumer.defaults === undefined) {
			const consumerClass = consumer.class as ClassValue | undefined;
			const ownClass = own !== undefined ? own.class : undefined;
			if (
				(ownClass === undefined || ownClass === '' || typeof ownClass === 'string') &&
				(consumerClass === undefined || !containsPlaceholder(consumerClass))
			) {
				const stable = ownClass ? this.#ownMerged(ownClass) : (this.#staticBase!.class as string);
				const klass =
					consumerClass === undefined ? stable : withConsumerClass(stable, consumerClass);
				let base: Record<string | symbol, unknown>;
				if (own === undefined) {
					base =
						klass === this.#staticBase!.class
							? this.#staticBase!
							: { ...this.#staticBase, class: klass };
				} else {
					base = { ...this.#staticBase, class: klass };
					for (const k in own) if (k !== 'class') base[k] = own[k];
				}
				return mergeSpreadProps(base, consumerAttrs(consumer, undefined), USER_LAYER);
			}
		}
		// Variants: the preset's, a consumer-local definition, or both — selected by `variantProps`
		// and the consumer's own props, whose selector keys then stay off the DOM.
		const local = consumer.variants
			? resolveLocalVariants(consumer.variants, state as never, consumer)
			: undefined;
		const variant =
			record?.variants || record?.compounds || local
				? mergeVariants(
						record?.variants,
						record?.class,
						record?.compounds,
						record?.defaults,
						local,
						null,
						spec.variantProps ? { ...consumer, ...spec.variantProps() } : consumer
					)
				: undefined;
		const consumed = resolveConsumedVariantKeys(record, consumer.variants as never, undefined);
		const layer = resolvePresetLayer(spec.layer?.(), state as never);
		// A part's own `class` (state classes: disabled, selected) sits after its base and before the
		// preset and the consumer's class, which is where `beforePreset` used to put it. Strings only:
		// the class memo caches flat string arrays. The key leaves the attribute object either way,
		// so an `undefined` own class can never blank the resolved one.
		let ownClass: string | undefined;
		if (own !== undefined && 'class' in own) {
			ownClass = own.class as string | undefined;
			const { class: _class, ...rest } = own;
			own = rest;
		}
		const consumerClass = consumer.class as ClassValue | undefined;
		const user = ownClass ? [spec.class, ownClass, '$preset'] : this.#userBase;
		const layerVariantClass = layer?.class
			? [variant?.class as ClassValue, layer.class]
			: (variant?.class as ClassValue | undefined);
		const presetClassForMerge = variant ? undefined : record?.class;
		// L2: the consumer's class is deliberately NOT in `user` -- the array the class memo keys and
		// compares on. A broad update rewrites `consumerClass` every tick, and folding it in here made
		// every entry a fresh shape the memo could never hit again. `user` stays the stable axis (base,
		// own state class, preset placeholder); `withConsumerClass` layers the consumer's class on top
		// afterward, uncached, at the same one-`cn()` cost shadcn's own call site pays.
		//
		// The one exception: a consumer class that itself carries a `$preset` sentinel -- a part
		// forwarding its OWN class-with-placeholder as another part's consumer class
		// (select-trigger.svelte handing [..., '$preset', klass] to DropdownMenu's Trigger). That
		// placeholder must be substituted by THIS merge, so it stays inside the array and takes the
		// one-call path exactly as before L2 -- never cached, since a class carrying its own sentinel
		// is never shape-stable across calls anyway.
		const klass = containsPlaceholder(consumerClass)
			? mergeClassesWithPreset(
					ownClass
						? [spec.class, ownClass, '$preset', consumerClass]
						: [spec.class, '$preset', consumerClass],
					presetClassForMerge,
					layerVariantClass,
					true
				)
			: withConsumerClass(
					mergePresetClasses(user, presetClassForMerge, layerVariantClass, true),
					consumerClass
				);
		const presetAttrs = record?.attrs as Record<string, unknown> | undefined;
		const variantAttrs = variant
			? variantAttributes(variant as Record<string, unknown>)
			: undefined;
		const layerAttrs = layer?.attrs as Record<string, unknown> | undefined;
		// `class` first, then the preset's, the variant's, the layer's and the part's own attributes,
		// then the consumer's: one object, in the order the element renders them. `defaults` are
		// author-supplied attributes with the LOWEST precedence: the preset, the variant, the layer,
		// the part's own attrs and the consumer's props all beat them — that is what makes
		// `type="button"` a default a consumer can replace rather than an override.
		//
		// Built key by key rather than five unconditional spreads: `{...undefined}` is a no-op but
		// still an object-shape transition V8 has to walk, and every layer here is `undefined` on the
		// common part. Order matches the spread it replaces exactly.
		const defaults = consumer.defaults as Record<string, unknown> | undefined;
		const base: Record<string | symbol, unknown> = { class: klass };
		if (defaults) Object.assign(base, defaults);
		if (presetAttrs) Object.assign(base, presetAttrs);
		if (variantAttrs) Object.assign(base, variantAttrs);
		if (layerAttrs) Object.assign(base, layerAttrs);
		if (own) Object.assign(base, own);
		return mergeSpreadProps(base, consumerAttrs(consumer, consumed), USER_LAYER);
	}

	#base(): unknown {
		return this.#spec.base?.() ?? this.#presetBase;
	}
	get attrs(): LeafAttrs {
		return this.#attrsFn() as LeafAttrs;
	}
	tag() {
		return this.#tag as string;
	}
	spread() {
		return this.#attrsFn();
	}
	class() {
		return this.#attrsFn().class as string;
	}
	attributes() {
		const { class: _klass, ...rest } = this.#attrsFn();
		return rest;
	}
	motion() {
		return this.#motion;
	}
	resolvedMotion() {
		return this.#spec.motion?.() ?? NO_MOTION;
	}
	// Decided once: a part's reason to escalate is declared in its spec, not discovered.
	mode() {
		const fixed = this.#tag as string;
		return (this.#mode ??= renderMode({
			isDiv: fixed === 'div',
			isHeading: fixed === 'h3',
			isButton: fixed === 'button',
			plain: false,
			motion: this.#spec.motion?.() ?? NO_MOTION,
			attrs: this.#attrsFn(),
			base: this.#base(),
			canLeafTransition: this.#motion !== undefined
		}));
	}
	renderer() {
		const target = resolveRenderTarget(this.#base(), HtmlElement);
		const { class: klass, ...rest } = this.#attrsFn();
		const rendererProps = resolveRendererProps(
			target,
			klass as string,
			this.tag(),
			rest,
			this.#spec.motion?.() ?? NO_MOTION,
			{ presentationResolved: target.kind === 'component' && target.component === HtmlElement }
		);
		return { component: resolveRendererComponent(target, SnippetAdapter), props: rendererProps };
	}
}

const warnedLiteralRender = new Set<string>();
function warnLiteralRender(key: string): void {
	if (warnedLiteralRender.has(key)) return;
	warnedLiteralRender.add(key);
	console.warn(
		`[ixirjs] preset "${key}" declares \`render\`, but the part renders a literal element and ignores it. A part honours \`render.as\`/\`render.base\` only when it dispatches through Kernel.render (declare \`as\` or \`base\` in its spec).`
	);
}

// ─── Render ────────────────────────────────────────────────────────────────────────────────────

type Branch = Snippet<[view: KernelElement, body?: ElementBody, arg?: unknown]>;

/** The leaf a rich part renders — bind it once: `const leaf = Kernel.render(el)`, then `{@render leaf(el, children, arg)}`. */
function render(el: KernelElement): Branch {
	return branchForMode(el.mode()) as unknown as Branch;
}

// ─── Context ───────────────────────────────────────────────────────────────────────────────────

export type KernelContext<T> = {
	/** The canonical context key (`@ixirjs/context/<name>`), for tests that seed a context map. */
	readonly key: string;
	share(value: T): T;
	get(): T | undefined;
	/** `get`, but `undefined` outside component init too — for objects built programmatically. */
	getOptional(): T | undefined;
	getOrThrow(message?: string): T;
};

/** A family's context: canonical key, one `share` at the root, `get` in every part. */
function context<T>(name: string): KernelContext<T> {
	const key = `@ixirjs/context/${name}`;
	return {
		key,
		[KERNEL_CONTEXT]: true,
		share(value) {
			setContext(key, value);
			return value;
		},
		get() {
			return getContext<T | undefined>(key);
		},
		getOptional() {
			try {
				return getContext<T | undefined>(key);
			} catch {
				return undefined;
			}
		},
		getOrThrow(message) {
			const value = getContext<T | undefined>(key);
			if (value === undefined) throw new Error(message ?? `[ixirjs] "${name}" context is missing.`);
			return value;
		}
	} as KernelContext<T>;
}

// ─── Small things every family needs ────────────────────────────────────────────────────────────

/** An SSR-deterministic element id: `${part}-${seed}`, the seed being the root's `$props.id()`. */
function id(seed: string, part: string): string {
	return `${part}-${seed}`;
}

/**
 * The same id, made unique when a part renders more than once under one family.
 *
 * Ids derive from the family's seed, so two `<Dialog.Header>`s under one root would otherwise
 * render `dialog-header-s1` twice — invalid HTML, and whichever one `aria-labelledby` names wins by
 * document order rather than by intent. The first instance keeps the canonical id (every cross-part
 * reference already points at it); later ones take the lowest free suffix. The slot is RELEASED on
 * teardown, so a part inside an `{#if}` reclaims its own id instead of drifting on every toggle.
 *
 * Deterministic across SSR and hydration: both passes initialise parts in document order, and the
 * server has no teardown to release anything.
 */
const idSlots = new WeakMap<object, Map<string, Set<number>>>();
function claimId(owner: object, seed: string, part: string): { id: string; release: () => void } {
	let byPart = idSlots.get(owner);
	if (!byPart) idSlots.set(owner, (byPart = new Map()));
	let used = byPart.get(part);
	if (!used) byPart.set(part, (used = new Set()));
	let n = 1;
	while (used.has(n)) n += 1;
	used.add(n);
	const base = id(seed, part);
	return { id: n === 1 ? base : `${base}-${n}`, release: () => used!.delete(n) };
}

/** A consumer handler composed before the part's own; the part's is skipped on `defaultPrevented`. */
function compose<H extends (...args: never[]) => unknown>(consumer: H | undefined, own: H): H {
	return consumer
		? (composeHandlers(own as never, consumer as never, USER_LAYER) as unknown as H)
		: own;
}

export const Kernel = Object.freeze({ element, render, context, id, claimId, compose });
