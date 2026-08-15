import { setContext } from 'svelte';
import type { Override } from '$ixirjs/ui/types';
import {
	Bond,
	type Atom,
	bondContextKey,
	defineAtom,
	type BondStateProps,
	type NodeCardinality
} from '$ixirjs/ui/shared/bond';
import type { Capability } from '$ixirjs/ui/shared/capability';
import { attachStateFactory } from '$ixirjs/ui/shared/authoring/define-runtime';
import { getBondSpec, markSynthesizedAtom, setBondSpec } from './metadata';

// bond: any lets atoms declare a narrower view without variance errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AtomConstructor = new (bond: any) => Atom<any, any>;

// `part` names the declarative slot. Atom identity stays owned by its constructor and
// registration is owned by createAtomInstance({ register }); neither is overloaded here.
export type AtomSpec =
	| AtomConstructor
	| {
			/**
			 * Omit for a presentation-free slot: `defineBond` synthesizes
			 * `defineAtom({ key: slot, namespace: spec.name })`, which is what a family's own
			 * `const slot = (key) => defineAtom({ key, namespace })` helper was producing — a slot
			 * name written three times (const, `defineAtom` key, map key) for one fact. Declare
			 * `atom` when the part carries attrs, handlers, or its own element type.
			 */
			atom?: AtomConstructor;
			part?: string;
			role?: string;
			/** Registration policy belongs to the declared part, not its Svelte call site. */
			cardinality?: NodeCardinality;
	  };
type AtomMap = Record<string, AtomSpec>;

// A slot that declares no `atom` gets the synthesized presentation-free Atom, hence the `Atom`
// fallback rather than `never`.
export type AtomInstance<E> = E extends AtomConstructor
	? InstanceType<E>
	: E extends { atom: infer C }
		? C extends AtomConstructor
			? InstanceType<C>
			: Atom
		: Atom;

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
export type PropsOf<S> = BaseInstance<S> extends Bond<infer P> ? P : BondStateProps;
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

/** Atom slots after ordered `parts:` composition; later definitions win per slot. */
export type AtomsOf<S> =
	PartsOf<S> extends [] ? OwnAtomsOf<S> : Override<MergePartAtoms<PartsOf<S>>, OwnAtomsOf<S>>;

type BaseInstance<S> = InstanceType<BaseOf<S>>;

/** The instance produced by a spec: its base class. */
export type DefinedBond<S extends BondSpec> = BaseInstance<S>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BondOf<C extends new (...args: any[]) => Bond> = InstanceType<C>;

/** Constructible definition facade. Its spec is type-only; no runtime metadata is public. */
export type DefinedBondClass<S extends BondSpec> = (new (props: PropsOf<S>) => DefinedBond<S>) &
	DefinitionPhantom<S, AtomsOf<S>> & {
		CONTEXT_KEY: string;
		readonly CONTEXT_KEYS?: readonly string[];
		get(): DefinedBond<S> | undefined;
		getOptional(): DefinedBond<S> | undefined;
		getOrThrow(message?: string): DefinedBond<S>;
		create(props: PropsOf<S>): DefinedBond<S>;
	};

/**
 * `base:` supplies the class, `atoms:` the slots, `parts:` flat composition over other definitions.
 *
 * There used to be a second composition operator, `extends:` (spec inheritance producing a real
 * subclass), and a `methods:` map that attached instance methods to the generated prototype. Both
 * ended with zero users — every family subclasses `Bond` itself for state and methods — while
 * `extends:` alone forked the constructor's `super` call, the context-key install, and the
 * capability composer into a two-question shape. Removing them left one path.
 */
export function defineBond<const S extends BondSpec>(spec: S): DefinedBondClass<S> {
	const composed = Boolean(spec.parts && spec.parts.length > 0);

	// `parts:` merges its members' specs, overridden per slot by the spec's own atoms, and runs
	// their capability factories before its own. Whether there is anything to compose at all is
	// known at definition time — most families register capabilities in their base class
	// constructor instead, and the old shape allocated up to three arrays per Bond construction
	// just to produce an empty list.
	const inheritedAtoms: Record<string, AtomSpec> = {};
	const inheritedCapabilityFns: ((bond: Bond) => Capability[])[] = [];

	for (const part of composed ? (spec.parts ?? []) : []) {
		const partSpec = getBondSpec(part);
		Object.assign(inheritedAtoms, partSpec.atoms);
		if (partSpec.capabilities) inheritedCapabilityFns.push(partSpec.capabilities);
	}

	const mergedAtoms: Record<string, AtomSpec> = { ...inheritedAtoms, ...spec.atoms };
	// A slot with no `atom` is presentation-free, and its whole declaration is derivable: the key is
	// the slot, the namespace is the definition's name. Synthesized once per definition, never per
	// render, so it costs what the hand-written const cost and states the slot name once.
	for (const slot of Object.keys(mergedAtoms)) {
		const entry = mergedAtoms[slot]!;
		if (typeof entry === 'function' || entry.atom) continue;
		const atom = defineAtom({ key: entry.part ?? slot, namespace: spec.name });
		// Recorded so `resolveBondPart` can tell a synthesized presentation-only Atom from a declared
		// one: a role-less synthesized slot is inert and skips Atom construction in `definePart`.
		markSynthesizedAtom(atom);
		mergedAtoms[slot] = { ...entry, atom };
	}
	// Widened for the seam; the runtime argument is always the constructed Bond.
	const ownCapabilities = spec.capabilities as ((bond: Bond) => Capability[]) | undefined;

	const hasCapabilities = inheritedCapabilityFns.length > 0 || ownCapabilities !== undefined;
	const composeCapabilities = (state: Bond): Capability[] => {
		if (inheritedCapabilityFns.length === 0) return ownCapabilities?.(state) ?? [];
		const out: Capability[] = [];
		for (const fn of inheritedCapabilityFns) out.push(...fn(state));
		if (ownCapabilities) out.push(...ownCapabilities(state));
		return out;
	};

	const BaseClass = (spec.base ?? Bond) as unknown as new (
		props: BondStateProps,
		name?: string
	) => Bond;

	class Defined extends BaseClass {
		constructor(props: PropsOf<S>) {
			// `name` drives the namespace via the getter below, not the ctor argument.
			super(props as BondStateProps, spec.name);
			// The bond itself is the state host, so capability factories receive it directly.
			if (hasCapabilities) {
				for (const capability of composeCapabilities(this)) this.capability(capability);
			}
		}

		override get namespace(): string {
			return spec.name;
		}

		override get preset(): string {
			return spec.preset ?? super.preset;
		}
	}

	Object.defineProperty(Defined, 'CONTEXT_KEY', {
		value: bondContextKey(spec.name),
		writable: true,
		configurable: true
	});

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

	// Self-construction (ADR 0012): every definition gets a static `create(props)` under its own
	// identity.
	attachStateFactory(Defined);

	// The recorded spec is flattened: `resolveBondPart` and Kernel read atoms from it,
	// and a further `parts: [ThisBond]` reads its capability factory.
	setBondSpec(Defined, {
		...spec,
		atoms: mergedAtoms,
		capabilities: composeCapabilities
	} as unknown as BondSpec<Record<string, AtomSpec>>);

	return Defined as unknown as DefinedBondClass<S>;
}
