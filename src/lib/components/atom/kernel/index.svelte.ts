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
import {
	divBranch,
	dynamicBranch,
	headingBranch,
	divLocal,
	dynamicLocal,
	divGlobal,
	dynamicGlobal
} from '../render/element-branches.svelte';
import {
	KERNEL_PROP_NAMES,
	STATIC_KERNEL_SEAM,
	useKernelElement,
	type KernelElement
} from './element.svelte';
import { componentBranch, elementBranch, FORWARD_BODY_ARG } from './element-render.svelte';
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
	const key = JSON.stringify([slot, options.as, options.class]);
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
	#prepared = false;
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

	tag(): string {
		return String((this.#preparedSource ?? this.#source()).as ?? this.plan.as);
	}

	class(): string {
		if (this.#prepared) {
			this.#prepared = false;
			return this.#preparedClass ?? '';
		}
		return this.#resolveClass() ?? '';
	}

	attrs(): Record<string | symbol, unknown> {
		const own = this.#preparedSource ?? this.#source();
		const source = this.#preparedRest ?? this.#options.rest?.() ?? own;
		const attrs: Record<string | symbol, unknown> = {
			id: this.id,
			'data-bond': DEV && this.bond ? this.bond.namespace : undefined,
			'data-kind': DEV ? `${this.plan.name}-${this.plan.slot}` : undefined,
			part: typeof own.part === 'string' ? own.part : undefined,
			...this.#options.attrs?.()
		};
		for (const key in source) {
			if (!KERNEL_PROP_NAMES.has(key)) attrs[key] = source[key];
		}
		for (const key of Object.getOwnPropertySymbols(source)) attrs[key] = source[key];
		if (this.#attachment) Object.assign(attrs, this.#attachment);
		this.#preparedSource = undefined;
		this.#preparedRest = undefined;
		return attrs;
	}

	/** Called by Kernel.render; caches the class for the immediately following branch invocation. */
	prepare(): boolean {
		const source = (this.#preparedSource = this.#source());
		const rest = (this.#preparedRest = this.#options.rest?.());
		this.#preparedClass = this.#resolveClass(source);
		this.#prepared = true;
		return (
			this.#preparedClass === undefined ||
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

// All renderer snippets share this runtime calling convention; each leaf narrows the final handle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KernelBody = Snippet<[any]> | Snippet<[]>;
type KernelRenderBranch = Snippet<
	[
		tag: string,
		klass: string,
		attrs: Record<string | symbol, unknown>,
		body?: KernelBody,
		bodyArg?: unknown,
		motion?: unknown,
		view?: KernelNode | KernelElement
	]
>;

/** Selects a native, HtmlElement, or custom-renderer leaf for one dispatch. */
function render(view: KernelNode | KernelElement): KernelRenderBranch {
	if (view instanceof KernelNode) {
		if (view.prepare()) return richBranch as KernelRenderBranch;
		if (view.plan.as === 'div') return divBranch as KernelRenderBranch;
		if (view.plan.as === 'h3') return headingBranch as KernelRenderBranch;
		return dynamicBranch as KernelRenderBranch;
	}
	const mode = view.mode();
	if (mode === 'div') return divBranch as KernelRenderBranch;
	if (mode === 'dynamic') return dynamicBranch as KernelRenderBranch;
	if (mode === 'divLocal') return divLocal as KernelRenderBranch;
	if (mode === 'dynamicLocal') return dynamicLocal as KernelRenderBranch;
	if (mode === 'divGlobal') return divGlobal as KernelRenderBranch;
	if (mode === 'dynamicGlobal') return dynamicGlobal as KernelRenderBranch;
	if (mode === 'element') return elementBranch as KernelRenderBranch;
	return componentBranch as KernelRenderBranch;
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

function hasRichProps(props: Record<string | symbol, unknown>): boolean {
	for (const key in props) {
		const value = props[key];
		if (key === 'global') return true;
		if (
			(key === 'base' ||
				key === 'variants' ||
				key === 'variantProps' ||
				key === 'defaults' ||
				key === 'oninit' ||
				key === 'presetLayer' ||
				key === 'bond' ||
				key === 'atom') &&
			value !== undefined
		) {
			return true;
		}
		if (
			(key === 'motion' ||
				key === 'initial' ||
				key === 'enter' ||
				key === 'exit' ||
				key === 'animate' ||
				key === 'onmount' ||
				key === 'ondestroy' ||
				key === 'onintroend' ||
				key === 'onexitend') &&
			value != null
		) {
			return true;
		}
	}
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
	part,
	root: part,
	node,
	element: useKernelElement,
	static: STATIC_KERNEL_SEAM,
	forward: FORWARD_BODY_ARG,
	render
});
