import { setContext } from 'svelte';
import {
	Bond,
	type Atom,
	bondContextKey,
	type BondStateProps,
	type Capability,
	type NodeCardinality
} from '$ixirjs/ui/shared/bond';
import { attachMethod, attachStateFactory } from '$ixirjs/ui/shared/authoring/define-runtime';
import { getBondSpec, setBondSpec } from './metadata';

// bond: any lets atoms declare a narrower view without variance errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AtomConstructor = new (bond: any) => Atom<any, any>;

// `part` names the declarative slot. Atom identity stays owned by its constructor and
// registration is owned by createAtomInstance({ register }); neither is overloaded here.
export type AtomSpec =
	| AtomConstructor
	| {
			atom: AtomConstructor;
			part?: string;
			role?: string;
			/** Registration policy belongs to the declared part, not its Svelte call site. */
			cardinality?: NodeCardinality;
	  };
type AtomMap = Record<string, AtomSpec>;

export type AtomInstance<E> = E extends AtomConstructor
	? InstanceType<E>
	: E extends { atom: infer C }
		? C extends AtomConstructor
			? InstanceType<C>
			: never
		: never;

// Abstract classes allowed. Omit makes the constraint structural: declaration emit expands
// inferred root `getBond()` returns, where Bond's private fields cannot be named across packages.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BondBaseClass = abstract new (...args: any[]) => Omit<Bond, never>;

// Definitions carry composition metadata in an internal WeakMap. Consumers cannot inspect it.
export type FusablePart = {
	readonly CONTEXT_KEY?: string;
	readonly CONTEXT_KEYS?: readonly string[];
};

/** The sole authoring input to defineBond. All output types are extracted from this value. */
export interface BondSpec<A extends AtomMap = AtomMap, Base extends BondBaseClass = BondBaseClass> {
	name: string;
	atoms: A;
	base?: Base;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	capabilities?: (state: any) => Capability[];
	preset?: string;
	parts?: readonly FusablePart[];
	extends?: FusablePart;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	methods?: Record<string, (this: any, ...args: any[]) => any>;
}

// This symbol exists only in the type system. Runtime composition remains private in metadata.ts.
declare const definitionSpec: unique symbol;
declare const definitionAtoms: unique symbol;
type DefinitionPhantom<S extends BondSpec = BondSpec, A extends AtomMap = AtomMap> = {
	readonly [definitionSpec]?: S;
	readonly [definitionAtoms]?: A;
};

/** Recovers a definition's source spec without exposing a runtime `.spec` property. */
export type SpecOf<D> = D extends DefinitionPhantom<infer S> ? S : never;
export type BaseOf<S> = S extends { base: infer Base extends BondBaseClass } ? Base : typeof Bond;
export type PartsOf<S> = S extends { parts: infer Parts extends readonly FusablePart[] }
	? Parts
	: [];
export type ExtendsOf<S> = S extends { extends: infer Parent extends FusablePart } ? Parent : never;
export type PropsOf<S> = BaseInstance<S> extends Bond<infer P> ? P : BondStateProps;
export type MethodsOf<S> = S extends {
	methods: infer Methods extends Record<string, (...args: never[]) => unknown>;
}
	? Methods
	: Record<never, never>;
type Override<Old, New> = Omit<Old, keyof New> & New;
type OwnAtomsOf<S> = S extends { atoms: infer A extends AtomMap } ? A : Record<never, never>;
type PartAtomsOf<Part> = [Part] extends [never]
	? Record<never, never>
	: Part extends DefinitionPhantom<BondSpec, infer A>
		? A
		: Record<never, never>;
type MergePartAtoms<
	Parts extends readonly FusablePart[],
	Merged extends AtomMap = Record<never, never>
> = Parts extends readonly [infer Head, ...infer Tail]
	? Tail extends readonly FusablePart[]
		? MergePartAtoms<Tail, Override<Merged, PartAtomsOf<Head>>>
		: Override<Merged, PartAtomsOf<Head>>
	: Merged;

/** One part's atom slots. */
export type AtomsOfPart<P> =
	P extends DefinedBondClass<infer S> ? AtomsOf<S> : Record<never, never>;

/** The atom slots a `parts: [...]` composition resolves to; later parts win per slot. */
export type MergeAtoms<Parts extends readonly FusablePart[]> = AtomsOf<{
	name: string;
	atoms: Record<never, never>;
	parts: Parts;
}>;

/** Atom slots after ordered parts/extends composition; later definitions win per slot. */
export type AtomsOf<S> =
	PartsOf<S> extends []
		? Override<PartAtomsOf<ExtendsOf<S>>, OwnAtomsOf<S>>
		: Override<MergePartAtoms<PartsOf<S>>, OwnAtomsOf<S>>;

type BaseClassOf<S> =
	PartsOf<S> extends []
		? [SpecOf<ExtendsOf<S>>] extends [never]
			? BaseOf<S>
			: ExtendsOf<S> extends BondBaseClass
				? ExtendsOf<S>
				: BaseOf<S>
		: BaseOf<S>;
type BaseInstance<S> = InstanceType<BaseClassOf<S>>;

/** The instance produced by a spec: its base class plus the spec's authored methods. */
export type DefinedBond<S extends BondSpec> = BaseInstance<S> & MethodsOf<S>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BondOf<C extends new (...args: any[]) => Bond> = InstanceType<C>;

/** Constructible definition facade. Its spec is type-only; no runtime metadata is public. */
export type DefinedBondClass<S extends BondSpec> = (new (props: PropsOf<S>) => DefinedBond<S>) &
	DefinitionPhantom<S, AtomsOf<S>> & {
		CONTEXT_KEY: string;
		readonly CONTEXT_KEYS?: readonly string[];
		get(): DefinedBond<S> | undefined;
		getOrThrow(message?: string): DefinedBond<S>;
		create(props: PropsOf<S>): DefinedBond<S>;
	};

/**
 * One construction path for both composition operators.
 *
 * `parts:` (flat composition, a rebrand) and `extends:` (spec inheritance, a real subclass) used to
 * be two ~100-line branches that each resolved state, overrode `namespace`/`preset`, installed a
 * context key, attached methods and the state factory, and recorded the spec — the same six steps,
 * written twice. What actually differs between them is three decisions, taken below as three
 * values: which class to extend, how the constructor reaches `super`, and which context keys the
 * definition answers to.
 *
 * `parts:` continues to take precedence over `extends:` when a spec somehow declares both, exactly
 * as the branch order did before.
 */
export function defineBond<const S extends BondSpec>(spec: S): DefinedBondClass<S> {
	const composed = Boolean(spec.parts && spec.parts.length > 0);

	// ─── Decision 1: the inherited atoms and capabilities ───
	// `parts:` merges its members' specs; `extends:` flattens its parent's. Both are overridden
	// per slot by the spec's own atoms, and both run their inherited capability factories first.
	const parent = (composed ? undefined : spec.extends) as DefinedBondClass<BondSpec> | undefined;
	const parentSpec = parent ? getBondSpec(parent) : undefined;
	const inheritedAtoms: Record<string, AtomSpec> = {};
	const inheritedCapabilityFns: ((bond: Bond) => Capability[])[] = [];

	for (const part of composed ? (spec.parts ?? []) : []) {
		const partSpec = getBondSpec(part);
		Object.assign(inheritedAtoms, partSpec.atoms);
		if (partSpec.capabilities) inheritedCapabilityFns.push(partSpec.capabilities);
	}
	if (parentSpec) {
		Object.assign(inheritedAtoms, parentSpec.atoms);
		if (parentSpec.capabilities) inheritedCapabilityFns.push(parentSpec.capabilities);
	}

	const mergedAtoms = { ...inheritedAtoms, ...spec.atoms };
	// Widened for the seam; the runtime argument is always the constructed Bond.
	const ownCapabilities = spec.capabilities as ((bond: Bond) => Capability[]) | undefined;

	// A subclass's parent constructor has already registered the parent's capabilities, so an
	// `extends:` child must only register its own. A `parts:` composition has no such constructor
	// chain and registers every member's. Whether any source exists at all is known at definition
	// time — most families register capabilities in their base class constructor instead, and the
	// old shape allocated up to three arrays per Bond construction just to produce an empty list.
	const inheritsCapabilities = !parent && inheritedCapabilityFns.length > 0;
	const hasConstructorCapabilities = inheritsCapabilities || ownCapabilities !== undefined;
	const constructorCapabilities = (state: Bond): Capability[] => {
		if (!inheritsCapabilities) return ownCapabilities?.(state) ?? [];
		const out: Capability[] = [];
		for (const fn of inheritedCapabilityFns) out.push(...fn(state));
		if (ownCapabilities) out.push(...ownCapabilities(state));
		return out;
	};

	// ─── Decision 2: the class to extend and how its constructor reaches `super` ───
	const BaseClass = ((composed ? spec.base : (spec.extends ?? spec.base)) ??
		Bond) as unknown as new (props: BondStateProps, name?: string) => Bond;

	class Defined extends BaseClass {
		constructor(props: PropsOf<S>) {
			// A parent ctor has already registered its own capabilities and takes only the props; a
			// raw base also takes the name. Either way `name` drives the namespace via the getter
			// below, not the ctor argument.
			if (parent) super(props as BondStateProps);
			else super(props as BondStateProps, spec.name);
			// The bond itself is the state host, so capability factories receive it directly.
			if (hasConstructorCapabilities) {
				for (const capability of constructorCapabilities(this)) {
					this.capability(capability);
				}
			}
		}

		override get namespace(): string {
			return spec.name;
		}

		override get preset(): string {
			return spec.preset ?? super.preset;
		}
	}

	// ─── Decision 3: the context keys this definition answers to ───
	// An `extends:` child inherits its parent's key, keeping the family unified. Everything else
	// gets its own — `parts:` is a rebrand, not an extension.
	if (!parent) {
		Object.defineProperty(Defined, 'CONTEXT_KEY', {
			value: bondContextKey(spec.name),
			writable: true,
			configurable: true
		});
	}

	if (composed) {
		// Transitive keys: a part contributes its full CONTEXT_KEYS, so e.g. a `<Popover.Trigger>`
		// inside a Select still resolves via `PopoverBond.get()`.
		const partContextKeys = [
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			...new Set(
				(spec.parts ?? []).flatMap((part) =>
					part.CONTEXT_KEYS
						? [...part.CONTEXT_KEYS]
						: [part.CONTEXT_KEY ?? bondContextKey(getBondSpec(part).name)]
				)
			)
		];
		Object.defineProperty(Defined, 'CONTEXT_KEYS', {
			value: [bondContextKey(spec.name), ...partContextKeys],
			writable: true,
			configurable: true
		});
		// `share()` also registers under each part's key so parts' own atom components resolve.
		const proto = Defined.prototype as unknown as { share: () => Bond };
		const baseShare = proto.share;
		Object.defineProperty(proto, 'share', {
			value(this: Bond) {
				baseShare.call(this);
				for (const key of partContextKeys) setContext(key, this);
				return this;
			},
			writable: true,
			configurable: true,
			enumerable: false
		});
	}

	for (const [name, fn] of Object.entries(spec.methods ?? {})) {
		attachMethod(Defined.prototype, name, fn);
	}

	// Self-construction (ADR 0012): every definition gets a static `create(props)` under its own
	// identity. A child via extends would otherwise inherit the parent's.
	attachStateFactory(Defined);

	// The recorded spec is the flattened one: `resolveBondPart` and `usePart` read atoms from it,
	// and a further `parts: [ThisBond]` reads its capability factory.
	setBondSpec(Defined, {
		...spec,
		atoms: mergedAtoms,
		capabilities: (bond: Bond): Capability[] => [
			...inheritedCapabilityFns.flatMap((fn) => fn(bond)),
			...(ownCapabilities?.(bond) ?? [])
		]
	} as unknown as BondSpec<Record<string, AtomSpec>>);

	return Defined as unknown as DefinedBondClass<S>;
}
