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
import { withDefaultBorder } from '$ixirjs/ui/components/element/class';
import {
	useElementMotion,
	type ElementMotion
} from '$ixirjs/ui/components/element/use-element-motion.svelte';
import { mergeSpreadProps, composeHandlers } from '$ixirjs/ui/kernel/merge';
import { mergeClassesWithPreset } from './resolve/classes';
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
	/** The part's OWN attributes and handlers — read inside the memo, so state reads are tracked. */
	attrs?: () => Record<string, unknown>;
	/** Handed to function-form preset entries and variant resolvers. */
	state?: unknown;
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

const EMPTY: Record<string, unknown> = Object.freeze({});
const NO_MOTION: object = Object.freeze({});
const USER_LAYER = Object.freeze({ nextIsUser: true });

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
	return out ?? EMPTY;
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

function element(props: () => Record<string, unknown>, spec: ElementSpec): KernelElement {
	// Preset installation is initialization-scoped: read once, like every caller before this one.
	const installed: Partial<Preset> | undefined = getPreset();
	const entryFor = (key: PresetModuleName | undefined): PresetEntry | undefined =>
		key === undefined ? undefined : installed?.[key];
	const staticRecord = (key: PresetModuleName | undefined, entry: PresetEntry | undefined) =>
		entry === undefined || key === undefined
			? undefined
			: typeof entry !== 'function'
				? toRecord(entry)
				: simpleRecord(entry, key);

	// Array form, hoisted: `mergeClassesWithPreset` memoises only a flat string array keyed on its
	// first element — the string form ran tailwind-merge on every render (10% of SSR self time).
	const userBase: readonly string[] = [spec.class, '$preset'];
	// ONE memo, deliberately. Splitting the expensive half (preset, variants, `tailwind-merge`) from
	// the cheap merge was tried on 2026-08-27 to stop an unrelated attribute change from re-resolving
	// classes — and MEASURED WORSE: card broad update 8.3 → 9.2 µs, card-direct 4.9 → 8.5, mount +1.5
	// on both. A broad update changes `class`, so the expensive half re-runs anyway, and the split
	// adds a second signal and a wrapper object per part. See §18 of perf-vs-shadcn-2026-08.md.
	const resolve = () => {
		const consumer = props();
		const key = (typeof consumer.preset === 'string' ? consumer.preset : spec.preset) as
			| PresetModuleName
			| undefined;
		const entry = entryFor(key);
		// Class-only default entries resolve once per entry; a function entry that may read state
		// resolves inside the memo so its reads are tracked.
		const record: PresetEntryRecord | undefined =
			staticRecord(key, entry) ??
			(typeof entry === 'function' ? toRecord(entry({ bond: spec.state } as never)) : undefined);
		// Variants: the preset's, a consumer-local definition, or both — selected by `variantProps`
		// and the consumer's own props, whose selector keys then stay off the DOM.
		const local = consumer.variants
			? resolveLocalVariants(consumer.variants, spec.state as never, consumer)
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
		const layer = resolvePresetLayer(spec.layer?.(), spec.state as never);
		let own = spec.attrs?.();
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
		const user = ownClass
			? consumerClass
				? [spec.class, ownClass, '$preset', consumerClass]
				: [spec.class, ownClass, '$preset']
			: consumerClass
				? [spec.class, '$preset', consumerClass]
				: userBase;
		const klass = withDefaultBorder(
			mergeClassesWithPreset(
				user,
				variant ? undefined : record?.class,
				layer?.class
					? [variant?.class as ClassValue, layer.class]
					: (variant?.class as ClassValue | undefined)
			)
		);
		const presetAttrs = record?.attrs as Record<string, unknown> | undefined;
		const variantAttrs = variant
			? variantAttributes(variant as Record<string, unknown>)
			: undefined;
		const layerAttrs = layer?.attrs as Record<string, unknown> | undefined;
		// `class` first, then the preset's, the variant's, the layer's and the part's own attributes,
		// then the consumer's: one object, in the order the element renders them.
		// `defaults` are author-supplied attributes with the LOWEST precedence: the preset, the
		// variant, the layer, the part's own attrs and the consumer's props all beat them. That is
		// what makes `type="button"` a default a consumer can replace rather than an override.
		const defaults = consumer.defaults as Record<string, unknown> | undefined;
		const base: Record<string | symbol, unknown> = {
			class: klass,
			...defaults,
			...presetAttrs,
			...variantAttrs,
			...layerAttrs,
			...own
		};
		return mergeSpreadProps(base, consumerAttrs(consumer, consumed), USER_LAYER);
	};

	// A preset's `render` is structural — which tag, which renderer — and is read once, at init, the
	// way the lane always was. It reaches the DOM only through `Kernel.render`: a part that spreads
	// `el.attrs` on a literal tag cannot honour it, and DEV says so once per key.
	const initialEntry = entryFor(spec.preset);
	const initialRecord =
		staticRecord(spec.preset, initialEntry) ??
		(typeof initialEntry === 'function'
			? toRecord(initialEntry({ bond: spec.state } as never))
			: undefined);
	const presetRender = initialRecord?.render;
	if (DEV && presetRender && spec.as === undefined && spec.base === undefined) {
		warnLiteralRender(spec.preset!);
	}

	// `oninit`: the string-keyed hook that survives server `rest_props`, so it fires synchronously
	// pre-mount on the server AND again on client hydration — keep it idempotent. Read untracked and
	// run here, during init, which is where the part is built; the returned cleanup runs on client
	// teardown only. Symbol-keyed lifecycle keys are gone with the old runtime.
	const oninit = untrack(() => props().oninit) as
		| ((state?: unknown) => void | (() => void))
		| undefined;
	if (oninit) {
		const cleanup = oninit(spec.state);
		if (BROWSER && typeof cleanup === 'function') $effect(() => cleanup);
	}

	// Motion a CONSUMER passed, for a part that declares none of its own: `motion`, or the four
	// phase props spelled separately. Read raw and untracked at init — reading a resolved
	// presentation here would make every part resolve eagerly (`resolve-count` cannot see that,
	// because an init-time read of a `$derived` neither counts nor subscribes).
	const consumerMotion = (): unknown => {
		const p = props();
		if (p.motion) return p.motion;
		if (p.initial || p.enter || p.exit || p.animate) {
			return { initial: p.initial, enter: p.enter, exit: p.exit, animate: p.animate };
		}
		return undefined;
	};
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
		(untrack(() => consumerMotion() !== undefined)
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

	if (!BROWSER) {
		const once = resolve();
		return view(() => once, effectiveSpec, motionRune, presetRender);
	}
	const attrs = $derived.by(resolve);
	return view(() => attrs, effectiveSpec, motionRune, presetRender);
}

class Handle implements KernelElement {
	readonly #attrs: () => Record<string | symbol, unknown>;
	readonly #spec: ElementSpec;
	readonly #motion: ElementMotion<never> | undefined;
	readonly #tag: string;
	/** The preset's `render.as`, when it declared one — the fallback for a part's own `as`. */
	readonly #fallbackTag: string;
	readonly #presetBase: unknown;
	#mode: RenderMode | undefined;

	constructor(
		attrs: () => Record<string | symbol, unknown>,
		spec: ElementSpec,
		motion: ElementMotion<never> | undefined,
		presetRender: PresetRender | undefined
	) {
		this.#attrs = attrs;
		this.#spec = spec;
		this.#motion = motion;
		this.#fallbackTag = presetRender?.as ?? (typeof spec.as === 'string' ? spec.as : 'div');
		// The tag is decided ONCE, at init — the same rule the lane always had. A consumer's `as`
		// (read here, at init) wins over the preset's `render.as`, which wins over the part's own; the
		// result is a fixed string, so `div`/`h3`/`button` take their literal leaf and anything else
		// the dynamic one. An `as` that changes after init is not honoured; nothing in the repo does.
		this.#tag =
			typeof spec.as === 'function' ? (spec.as() ?? this.#fallbackTag) : this.#fallbackTag;
		this.#presetBase = presetRender?.base;
	}
	#base(): unknown {
		return this.#spec.base?.() ?? this.#presetBase;
	}
	get attrs(): LeafAttrs {
		return this.#attrs() as LeafAttrs;
	}
	tag() {
		return this.#tag as string;
	}
	spread() {
		return this.#attrs();
	}
	class() {
		return this.#attrs().class as string;
	}
	attributes() {
		const { class: _klass, ...rest } = this.#attrs();
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
			attrs: this.#attrs(),
			base: this.#base(),
			canLeafTransition: this.#motion !== undefined
		}));
	}
	renderer() {
		const target = resolveRenderTarget(this.#base(), HtmlElement);
		const { class: klass, ...rest } = this.#attrs();
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

function view(
	attrs: () => Record<string | symbol, unknown>,
	spec: ElementSpec,
	motionRune: ElementMotion<never> | undefined,
	presetRender: PresetRender | undefined
): KernelElement {
	// A class, one allocation per part: the closure-object form was 9% of SSR self time on a card.
	return new Handle(attrs, spec, motionRune, presetRender);
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
	};
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
