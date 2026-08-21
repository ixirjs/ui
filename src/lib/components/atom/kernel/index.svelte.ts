import { onDestroy, untrack, type Snippet } from 'svelte';
import type { ClassValue } from 'svelte/elements';
import { BROWSER, DEV } from 'esm-env';
import { getPreset } from '$ixirjs/ui/context';
import { defaultPreset } from '$ixirjs/ui/preset/default';
import type {
	PresetEntry,
	PresetEntryRecord,
	PresetKey,
	PresetLike,
	PresetModuleName
} from '$ixirjs/ui/preset';
import type { Atom } from '$ixirjs/ui/shared/bond/atom.svelte';
import type { Bond } from '$ixirjs/ui/shared/bond';
import { mergeAtomProps } from '$ixirjs/ui/shared/bond/presentation-props';
import {
	lazyNodeAttachment,
	type LazyNodeDescriptor
} from '$ixirjs/ui/shared/bond/node-registry.svelte';
import { generateId } from '$ixirjs/ui/shared/bond/identity';
import { missingRootMessage, resolveBondPart } from '$ixirjs/ui/shared/authoring/metadata';
import type {
	AtomInstance,
	AtomsOf,
	BondSpec,
	SpecOf
} from '$ixirjs/ui/shared/authoring/define.svelte';
import { getElementId } from '$ixirjs/ui/utils/dom.svelte';
import { mergeClassesWithPreset } from '../resolve/classes';
import { hasMintedLifecycleKeys, isLifecycleKey } from '../render/lifecycle.svelte';
import { KERNEL_PROP_NAMES, needsPresentation } from '../render/kernel-props';
import {
	buttonBranch,
	divBranch,
	divPlain,
	dynamicBranch,
	headingBranch,
	headingPlain,
	type ElementBody
} from '../render/element-branches.svelte';
import { STATIC_KERNEL_SEAM, useKernelElement, type KernelElement } from './element.svelte';
import type { RenderMode } from '../render/render-mode';
import { branchForMode, FORWARD_BODY_ARG } from './element-render.svelte';
import { richBranch } from './render.svelte';

const defaultRecords = new WeakMap<object, PresetEntryRecord>();
const finalClasses = new WeakMap<object, WeakMap<object, string>>();
const plans = new WeakMap<object, Map<string, KernelPlan>>();
const EMPTY_CONTEXT = Object.freeze({ bond: undefined, props: Object.freeze({}) });

// Atom's Bond/element parameters are intentionally preserved by each definition-derived plan.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAtom = Atom<any, any>;

type Definition = {
	get(): Bond | undefined;
	getOrThrow(message?: string): Bond;
};
type DefinitionBond<D extends Definition> = ReturnType<D['getOrThrow']>;
type PartKey<S extends BondSpec> = keyof AtomsOf<S> & string;
type PartAtom<S extends BondSpec, K extends PartKey<S>> = AtomInstance<AtomsOf<S>[K]>;

type PlanOptions = {
	as?: string;
	class: string;
};

export type KernelPlan<B extends Bond = Bond, N extends AnyAtom = AnyAtom> = Readonly<{
	name: string;
	slot: string;
	as: string;
	class: string;
	preset: PresetModuleName;
	fallbackClass: string;
	defaultClass: string | undefined;
	inert: boolean;
	/** The slot's Atom adds nothing but `id` to the spread — see `ResolvedBondPart.synthesized`. */
	synthesized: boolean;
	definition: Definition;
	node: ReturnType<typeof resolveBondPart>['nodePlan'];
	/** Type witnesses retained for definition-derived Bond and Atom inference. */
	readonly __bond?: B;
	readonly __atom?: N;
}>;

export type KernelNodeOptions<B extends Bond = Bond> = {
	bond?: B | undefined;
	/** Required for first-party descendants; optional supports deliberately bondless parts. */
	context?: 'required' | 'optional';
	message?: string;
	/** Root components already split semantic props from element attrs; simple parts omit this. */
	rest?: (() => Record<string | symbol, unknown>) | undefined;
	/** Leaf-only semantic attrs. Rich mode obtains them from the materialized Atom. */
	attrs?: (() => Record<string | symbol, unknown>) | undefined;
	beforePreset?: (() => ClassValue) | undefined;
	/** This node is rendered directly, so it may resolve its own rich element during init. */
	eagerElement?: boolean | undefined;
};

type KernelSource = Record<string | symbol, unknown>;

function part<const D extends Definition, K extends PartKey<SpecOf<D>>>(
	definition: D,
	slot: K,
	options: PlanOptions
): KernelPlan<DefinitionBond<D>, PartAtom<SpecOf<D>, K>>;
function part(definition: Definition, slot: string, options: PlanOptions): KernelPlan;
function part(definition: Definition, slot: string, options: PlanOptions): KernelPlan {
	let byKey = plans.get(definition);
	// String concat, not JSON.stringify: `definePart` resolves its plan per component INSTANCE
	// rather than at module scope, so this key is built on every rendered part of every such family.
	// The three fields are a slot name, a tag and a class string — none can contain a NUL — so
	// joining on one is as unambiguous as JSON and does not walk an array through a serializer.
	const key = `${slot}\u0000${options.as ?? ''}\u0000${options.class}`;
	const cached = byKey?.get(key);
	if (cached) return cached;

	const resolved = resolveBondPart(definition, slot);
	const preset = (slot === 'root' ? resolved.name : `${resolved.name}.${slot}`) as PresetModuleName;
	const defaultRecord = simpleRecord(defaultPreset[preset], preset);
	const plan = Object.freeze({
		name: resolved.name,
		slot,
		as: options.as ?? 'div',
		class: options.class,
		preset,
		fallbackClass: mergeClassesWithPreset(`${options.class} $preset`, undefined, undefined),
		defaultClass: defaultRecord
			? mergeClassesWithPreset(`${options.class} $preset`, defaultRecord.class, undefined)
			: undefined,
		inert: resolved.inert,
		synthesized: resolved.synthesized,
		definition,
		node: resolved.nodePlan
	});
	if (!byKey) plans.set(definition, (byKey = new Map()));
	byKey.set(key, plan);
	return plan;
}

/** One component instance's complete rendering state. */
export class KernelNode<
	B extends Bond | undefined = Bond | undefined,
	N extends AnyAtom = AnyAtom
> {
	readonly plan: KernelPlan<Exclude<B, undefined>, N>;
	readonly bond: B;
	readonly descriptor: LazyNodeDescriptor | undefined;
	#id: string | undefined;
	readonly #source: () => KernelSource;
	readonly #options: KernelNodeOptions;
	readonly #attachment: Record<symbol, unknown> | undefined;
	#atom: N | undefined;
	/** Set when this node was already rich at init and therefore owns its own resolved element. */
	readonly element: KernelElement | undefined;
	#prepared = false;
	#plain = false;
	#preparedClass: string | undefined;
	#preparedSource: KernelSource | undefined;
	#preparedRest: Record<string | symbol, unknown> | undefined;

	constructor(
		plan: KernelPlan<Exclude<B, undefined>, N>,
		source: () => KernelSource,
		options: KernelNodeOptions<Exclude<B, undefined>> = {}
	) {
		this.plan = plan;
		this.#source = source;
		this.#options = options;
		const bond = options.bond ?? plan.definition.get();
		if (options.context === 'required' && !bond) {
			throw new Error(options.message ?? missingRootMessage(plan.name, plan.slot));
		}
		this.bond = bond as B;
		this.descriptor = bond && !plan.inert ? bond.registerLazyNode(plan.node) : undefined;
		this.#attachment = BROWSER && this.descriptor ? lazyNodeAttachment(this.descriptor) : undefined;
		if (BROWSER && this.descriptor) {
			onDestroy(() => bond!.unregisterLazyNode(this.descriptor!));
		}

		// The lane, decided here, once, while init is still open.
		//
		// A node whose props are already rich cannot be served by the class-only lane, and resolving
		// its presentation needs `$derived`, `$effect.pre` and `$effect` — which can only be created
		// during initialization. `Kernel.render` runs per render, so escalation discovered THERE had
		// to mount `RichPart` purely to reopen an init context: +7.5 µs and +4 hydration anchors per
		// part, measured by the `escalated` arm of `bench:lanes`. Asked here it costs one predicate,
		// and the part then renders through the same leaves every other element uses.
		//
		// `RichPart` still exists for the case this cannot see — props that turn rich AFTER init —
		// which is why `prepare()` keeps its per-render check. That path is rare and stays correct.
		this.element =
			this.#options.eagerElement && this.escalates()
				? useKernelElement(this, this.elementConfig)
				: undefined;
	}

	/** Stable semantic Atom, materialized only when a caller or the rich element seam needs it. */
	get atom(): N {
		if (this.descriptor) return this.descriptor.materialize() as N;
		if (this.#atom) return this.#atom;

		const atom = untrack(() => this.plan.node.create(this.bond as Bond)) as N;
		if (!this.bond && this.#id) atom.bindId(() => this.#id);
		atom.activateCapabilities(this.bond);
		if (BROWSER) onDestroy(() => atom.destroyCapabilities());
		return (this.#atom = atom);
	}

	get id(): string {
		if (this.descriptor) return this.descriptor.id;
		if (this.#atom) return this.#atom.id;
		return (this.#id ??= getElementId(
			this.bond?.id ?? generateId(),
			`${this.plan.name}-${this.plan.slot}`
		));
	}

	get slot(): string {
		return this.plan.slot;
	}

	get preset(): PresetKey | undefined {
		return (this.#source().preset ?? this.atom.preset) as PresetKey | undefined;
	}

	get presetLayer(): PresetLike | undefined {
		return (this.#source().presetLayer ?? this.bond?.presetLayer(this.plan.slot)) as
			| PresetLike
			| undefined;
	}

	/** Merged packet for parts that forward their Atom props to another component. */
	get props(): ReturnType<typeof mergeAtomProps> {
		return mergeAtomProps(
			this.atom,
			this.#source().preset,
			this.#options.rest?.() ?? {},
			this.bond?.presetLayer(this.plan.slot)
		);
	}

	get source(): KernelSource {
		const source = this.#source();
		if (!this.#options.rest) return source;
		return { ...source, ...this.#options.rest() };
	}

	// The three `ElementView` methods. They delegate when this node resolved its own element, so the
	// call site keeps passing the node and the leaves keep reading one shape — the node IS the handle
	// on both lanes, and which lane it took is not something a caller has to know.
	tag(): string {
		if (this.element) return this.element.tag();
		return String((this.#preparedSource ?? this.#source()).as ?? this.plan.as);
	}

	motion(): ReturnType<KernelElement['motion']> {
		return this.element?.motion();
	}

	// The rest of the `KernelElement` surface, delegated. Only the escalation leaves read these
	// (`elementBranch` and `componentBranch`), and `Kernel.render` reaches those only through
	// `this.element.mode()` — so the non-null assertion is the branch table's own precondition.
	mode(): RenderMode {
		return this.element!.mode();
	}

	/**
	 * The resolved class — the escalated element's on the rich lane, this render's on the plain one.
	 *
	 * `divPlain` reads this instead of `spread()`, so it is also where the prepared cache is
	 * consumed and cleared. Same contract `spread()` has always had (read once, clear), stated here
	 * because the plain leaf never calls `spread()` at all.
	 */
	class(): string {
		if (this.element) return this.element.class();
		const klass = this.#prepared ? (this.#preparedClass ?? '') : (this.#resolveClass() ?? '');
		this.#prepared = false;
		this.#preparedSource = undefined;
		this.#preparedRest = undefined;
		return klass;
	}

	/** The three attributes `divPlain` declares alongside the class. */
	plainId(): string {
		return this.id;
	}

	plainBond(): string | undefined {
		return DEV && this.bond ? this.bond.namespace : undefined;
	}

	plainKind(): string | undefined {
		return DEV ? `${this.plan.name}-${this.plan.slot}` : undefined;
	}

	/** Valid only for the render `prepare()` just answered for. Read by `Kernel.render`, once. */
	get plain(): boolean {
		return this.#plain;
	}

	attrs(): Record<string | symbol, unknown> {
		return this.element!.attrs();
	}

	resolvedMotion(): object {
		return this.element!.resolvedMotion();
	}

	renderer(): ReturnType<KernelElement['renderer']> {
		return this.element!.renderer();
	}

	/**
	 * The element's complete attribute object, `class` included, built once per render.
	 *
	 * This is the only consumer of what `prepare()` cached, so the cache is read and cleared in one
	 * call. The previous shape handed the class forward through a `#prepared` flag that `class()`
	 * consumed and `attrs()` cleared, correct only while every branch called them in that order — a
	 * rule stated in a comment and enforced by nothing. The four transition leaves read attrs first
	 * and were safe only because a node never reaches them.
	 */
	spread(): Record<string | symbol, unknown> {
		if (this.element) return this.element.spread();
		const own = this.#preparedSource ?? this.#source();
		const source = this.#preparedRest ?? this.#options.rest?.() ?? own;
		const klass = this.#prepared ? (this.#preparedClass ?? '') : (this.#resolveClass(own) ?? '');
		this.#prepared = false;
		// Only keys that can actually carry a value. `data-bond`/`data-kind` are DEV-only and `part` is
		// almost always absent, but as object-literal entries they existed in production too — three
		// keys per rendered part that Svelte's `attributes()` walk visited and skipped, and that walk
		// plus `is_boolean_attribute` is 8.4% of card self time. Emitted output is unchanged: an
		// `undefined` value was never written as an attribute, so this removes iterations, not markup.
		const attrs: Record<string | symbol, unknown> = { class: klass, id: this.id };
		if (DEV) {
			if (this.bond) attrs['data-bond'] = this.bond.namespace;
			attrs['data-kind'] = `${this.plan.name}-${this.plan.slot}`;
		}
		if (typeof own.part === 'string') attrs.part = own.part;
		// Same reason the three keys above went: an atom's attrs thunk states every attribute the part
		// can ever carry, and most of them are `undefined` on most renders — `card-root` alone declares
		// seven and emits two. `Object.assign` copied all seven as own keys for Svelte's `attributes()`
		// walk to visit and skip. A key the source also carries is kept even when undefined, because
		// dropping it here would move the attribute to the source's position in the object and the
		// rendered byte order with it.
		const extra = this.#options.attrs?.();
		if (extra) {
			for (const key in extra) {
				const value = extra[key];
				if (value !== undefined || key in source) attrs[key] = value;
			}
		}
		for (const key in source) {
			if (!KERNEL_PROP_NAMES.has(key)) attrs[key] = source[key];
		}
		for (const key of Object.getOwnPropertySymbols(source)) attrs[key] = source[key];
		if (this.#attachment) Object.assign(attrs, this.#attachment);
		this.#preparedSource = undefined;
		this.#preparedRest = undefined;
		return attrs;
	}

	/** Called by Kernel.render; resolves the class once and reports whether the lane suffices. */
	prepare(): boolean {
		const source = (this.#preparedSource = this.#source());
		const rest = (this.#preparedRest = this.#options.rest?.());
		const klass = (this.#preparedClass = this.#resolveClass(source));
		this.#prepared = true;
		if (this.#isRich(source, rest, klass)) return true;
		// Can this render be written as literal attributes? Only if every attribute the spread would
		// carry is one `divPlain` declares. The cheap disqualifiers come first; the source walk is the
		// same one `spread()` would do, and in the plain case it replaces it rather than adding to it.
		//
		// `klass === ''` is excluded deliberately: `attr_class('')` emits nothing where the spread path
		// emits `class=""`, and ~25 plans declare an empty base class. Those parts keep `divBranch`.
		this.#plain =
			klass !== '' &&
			this.#options.attrs === undefined &&
			this.#attachment === undefined &&
			typeof source.part !== 'string' &&
			isPlainAttrSource(rest ?? source);
		return false;
	}

	/**
	 * The same question `prepare()` answers, asked at INIT and without priming its cache.
	 *
	 * The leaf seam calls this once while the component is initializing, which is the only moment a
	 * `KernelElement` can legally be built — `useKernelElement` creates `$derived`, `$effect.pre` and
	 * `$effect`, and effects cannot be created during a render pass. A part that is already rich when
	 * it initializes therefore builds its element here and renders through the ordinary leaves, rather
	 * than mounting `RichPart` on every render purely to obtain a deferred init context.
	 *
	 * It must NOT leave `#preparedClass`/`#preparedSource` primed: `spread()` reads and clears that
	 * cache, and a value stashed at init would be one render stale by the time anything spread it.
	 */
	escalates(): boolean {
		const source = this.#source();
		const rest = this.#options.rest?.();
		return this.#isRich(source, rest, this.#resolveClass(source));
	}

	/**
	 * The element config for a part that renders itself.
	 *
	 * One builder, shared by the init lane (`definePart`) and the late lane (`RichPart`), because they
	 * describe the same element — the same source, the same tag default, the same
	 * `[base, beforePreset, $preset, consumer]` class order. Held as a bound arrow rather than a
	 * method so it can be handed to `Kernel.element` directly, and allocated once per node.
	 */
	readonly elementConfig = (): KernelSource => {
		const source = this.source;
		return {
			...source,
			as: source.as ?? this.plan.as,
			class: [this.plan.class, this.beforePreset(), '$preset', source.class]
		};
	};

	#isRich(
		source: KernelSource,
		rest: KernelSource | undefined,
		klass: string | undefined
	): boolean {
		return (
			klass === undefined ||
			(source.as !== undefined && source.as !== this.plan.as) ||
			typeof source.part === 'object' ||
			hasRichProps(rest ?? source)
		);
	}

	beforePreset(): ClassValue | undefined {
		return this.#options.beforePreset?.();
	}

	#resolveClass(source = this.#source()): string | undefined {
		return klass(
			this.plan,
			source.preset,
			source.class as ClassValue | null | undefined,
			this.#options.beforePreset?.()
		);
	}
}

function node<B extends Bond, N extends AnyAtom>(
	plan: KernelPlan<B, N>,
	source: () => KernelSource,
	options: KernelNodeOptions<B> & { context: 'required' }
): KernelNode<B, N>;
function node<B extends Bond, N extends AnyAtom>(
	plan: KernelPlan<B, N>,
	source: () => KernelSource,
	options: KernelNodeOptions<B> & { bond: B }
): KernelNode<B, N>;
function node<B extends Bond, N extends AnyAtom>(
	plan: KernelPlan<B, N>,
	source: () => KernelSource,
	options?: KernelNodeOptions<B>
): KernelNode<B | undefined, N>;
function node(
	plan: KernelPlan,
	source: () => KernelSource,
	options: KernelNodeOptions = {}
): KernelNode {
	return new KernelNode(plan, source, options);
}

/**
 * The runtime calling convention every leaf shares: the handle, then the body and the argument it
 * is dispatched with. `tag`/`class`/`attrs`/`motion` are read off the handle by the branch itself —
 * they were methods on the very object the caller passes, so naming them at the call site restated
 * it four times over.
 */
type KernelRenderBranch = Snippet<
	[view: KernelNode | KernelElement, body?: ElementBody, arg?: unknown]
>;

/** Selects a native, HtmlElement, or custom-renderer leaf for one dispatch. */
function render(view: KernelNode | KernelElement): KernelRenderBranch {
	if (view instanceof KernelNode) {
		// Resolved at init: the same branch table every element uses, dispatched against the node,
		// whose view methods forward to the element it owns.
		if (view.element) return branchForMode(view.element.mode()) as KernelRenderBranch;
		// Turned rich after init — the one case that still needs a deferred init context.
		if (view.prepare()) return richBranch as KernelRenderBranch;
		if (view.plan.as === 'div') {
			return (view.plain ? divPlain : divBranch) as KernelRenderBranch;
		}
		if (view.plan.as === 'h3') {
			return (view.plain ? headingPlain : headingBranch) as KernelRenderBranch;
		}
		if (view.plan.as === 'button') return buttonBranch as KernelRenderBranch;
		return dynamicBranch as KernelRenderBranch;
	}
	return branchForMode(view.mode()) as KernelRenderBranch;
}

/**
 * Does this source contribute any attribute beyond the ones `divPlain` writes literally?
 *
 * Mirrors `spread()`'s own two loops exactly — the same `for…in` without `hasOwn`, the same symbol
 * sweep — so a key that would have landed on the element can never be missed here.
 */
function isPlainAttrSource(source: KernelSource): boolean {
	for (const key in source) {
		if (!KERNEL_PROP_NAMES.has(key)) return false;
	}
	return Object.getOwnPropertySymbols(source).length === 0;
}

/** Class-only default lane. Undefined selects the canonical rich presentation path. */
function klass(
	plan: KernelPlan,
	preset: unknown,
	consumer: ClassValue | null | undefined,
	beforePreset?: ClassValue
): string | undefined {
	const key = (typeof preset === 'string' ? preset : plan.preset) as PresetModuleName;
	const entry = getPreset(key);
	const hasConsumer = consumer != null && consumer !== '';
	if (
		preset === undefined &&
		!hasConsumer &&
		!beforePreset &&
		entry === defaultPreset[plan.preset] &&
		plan.defaultClass !== undefined
	) {
		return plan.defaultClass;
	}
	const record = simpleRecord(entry, key);
	if ((preset !== undefined && typeof preset !== 'string') || (entry !== undefined && !record)) {
		return undefined;
	}
	if (!hasConsumer && !beforePreset) {
		if (!entry) return plan.fallbackClass;
		let byPlan = finalClasses.get(entry as object);
		const cached = byPlan?.get(plan);
		if (cached !== undefined) return cached;
		const resolved = mergeClassesWithPreset(`${plan.class} $preset`, record?.class, undefined);
		if (!byPlan) finalClasses.set(entry as object, (byPlan = new WeakMap()));
		byPlan.set(plan, resolved);
		return resolved;
	}
	const source = beforePreset
		? [plan.class, beforePreset, '$preset', consumer]
		: !hasConsumer
			? `${plan.class} $preset`
			: typeof consumer === 'string'
				? `${plan.class} $preset ${consumer}`
				: [plan.class, '$preset', consumer];
	return mergeClassesWithPreset(source, record?.class, undefined);
}

/**
 * The class-only lane's escalation test: the shared prop vocabulary, plus this seam's own
 * lifecycle-symbol question. The vocabulary lives in `render/kernel-props.ts` so the element lane
 * and this one cannot drift; the symbol scan stays here because it depends on whether any
 * lifecycle key has ever been minted, which is Kernel runtime state rather than a name list.
 */
function hasRichProps(props: Record<string | symbol, unknown>): boolean {
	if (needsPresentation(props)) return true;
	if (!hasMintedLifecycleKeys()) return false;
	return Object.getOwnPropertySymbols(props).some(isLifecycleKey);
}

function simpleRecord(
	entry: PresetEntry | undefined,
	key: PresetModuleName
): PresetEntryRecord | undefined {
	if (!entry) return undefined;
	if (typeof entry !== 'function') return isClassOnly(entry) ? entry : undefined;
	if (entry !== defaultPreset[key]) return undefined;
	let record = defaultRecords.get(entry);
	if (!record) {
		const value = entry(EMPTY_CONTEXT as never);
		if (!isClassOnly(value)) return undefined;
		record = value;
		defaultRecords.set(entry, record);
	}
	return record;
}

function isClassOnly(value: unknown): value is PresetEntryRecord {
	if (!value || typeof value !== 'object' || 'kind' in value) return false;
	for (const key in value) if (key !== 'class') return false;
	return true;
}

export const Kernel = Object.freeze({
	/**
	 * Compile a slot's immutable authoring metadata, once per module.
	 *
	 * Named `plan` because that is what it returns. It answered to `part` and `root` — one function
	 * under two names, where the second existed only so a root component could read as if it called
	 * something root-shaped. Nothing behaved differently, so the alias bought a reader the false
	 * impression of a distinction and cost them a lookup to discover there was none.
	 */
	plan: part,
	node,
	element: useKernelElement,
	static: STATIC_KERNEL_SEAM,
	forward: FORWARD_BODY_ARG,
	render
});
