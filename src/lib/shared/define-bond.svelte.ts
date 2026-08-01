import { setContext } from 'svelte';
import {
	Bond,
	BondState,
	bondContextKey,
	type AtomRegistry,
	type BondAtom,
	type BondStateProps,
	type Capability
} from './bond.svelte';

// defineBond — authoring surface (§6): collapses Bond boilerplate (CONTEXT_KEY, ctor, accessors).
// Atom classes and BondState are still authored as classes; Fusion (§9) uses parts: [...].

// Atom constructor new XAtom(bond). bond: any lets atoms declare a narrower view (§12.2) without variance errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AtomConstructor = new (bond: any) => BondAtom<any, any>;

// Method→atom mapping: class directly (method name == atom key), or { atom, key?, role? } with overrides.
export type AtomSpec = AtomConstructor | { atom: AtomConstructor; key?: string; role?: string };

// Atom instance type a method returns, for either AtomSpec form.
export type AtomInstance<E> = E extends AtomConstructor
	? InstanceType<E>
	: E extends { atom: infer C }
		? C extends AtomConstructor
			? InstanceType<C>
			: never
		: never;

// A Bond-subclass constructor a spec can base: instead of Bond (§9.4); abstract bases allowed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BondBaseClass = abstract new (...args: any[]) => Bond;

// Shape a bond must satisfy to be a parts: part. DefinedBondClass satisfies it; hand-written bonds via a spec getter.
export type FusablePart = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly spec: BondSpec<any>;
	readonly CONTEXT_KEY?: string;
	readonly CONTEXT_KEYS?: readonly string[];
};

export interface BondSpec<
	A extends Record<string, AtomSpec>,
	Base extends BondBaseClass = typeof Bond
> {
	// DOM namespace + default preset base + context key (e.g. 'collapsible').
	name: string;
	// Method name → atom. Each becomes a cached, typed factory.
	atoms: A;
	// Base bond class to extend (default Bond) — e.g. ModalOverlay for overlay machinery.
	base?: Base;
	// Capabilities registered on the bond at construction (delegates to state).
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	capabilities?: (state: any) => Capability[];
	// Dotted preset base when it differs from name (e.g. accordion.item).
	preset?: string;
	// Flat composition (ADR 0004 D1): parts contribute atoms + capabilities, later wins; preferred over extends.
	parts?: readonly FusablePart[];
	// Spec inheritance (§13): real subclass inheriting CONTEXT_KEY/instanceof/atoms; superseded by parts:.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extends?: DefinedBondClass<any, any, any>;
	// Non-atom prototype methods; inherited/overridable via extends.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	methods?: Record<string, (this: any, ...args: any[]) => any>;
}

// Generated bond instance: Bond with state re-typed to State, plus a cached factory per atom slot.
export type DefinedBond<
	A extends Record<string, AtomSpec>,
	State extends BondState = BondState,
	Base extends BondBaseClass = typeof Bond,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	M extends Record<string, (...args: any[]) => any> = Record<never, never>
> = InstanceType<Base> & { readonly state: State } & {
	[K in keyof A]: () => AtomInstance<A[K]>;
} & M;

// Spec-derived type utilities (ADR 0004 Decision 4) — replace the manual recipes every bond author repeats.

// Instance type of any Bond constructor — alias for InstanceType<typeof X>.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BondOf<C extends new (...args: any[]) => Bond> = InstanceType<C>;

// Minimal bond shape an atom types this.bond against: any Bond whose state is S.
export type ViewOf<S extends BondState> = Bond & { state: S };

// Extract the State type from a bond constructor: new (state: S) => Bond → S.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StateOf<C extends new (state: any) => Bond> = C extends new (state: infer S) => Bond
	? S
	: never;

// Generated bond class: constructible, with Bond's static context API and its originating spec.
export type DefinedBondClass<
	A extends Record<string, AtomSpec>,
	State extends BondState = BondState,
	Base extends BondBaseClass = typeof Bond,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	M extends Record<string, (...args: any[]) => any> = Record<never, never>
> = (new (state: State) => DefinedBond<A, State, Base, M>) & {
	CONTEXT_KEY: string;
	// Transitive context-key list from parts: path; absent on non-composed bonds.
	readonly CONTEXT_KEYS?: readonly string[];
	get(): DefinedBond<A, State, Base, M> | undefined;
	set(bond: DefinedBond<A, State, Base, M>): DefinedBond<A, State, Base, M>;
	// The spec this bond was defined from — the seam Fusion composes over (§9).
	readonly spec: BondSpec<A, Base>;
};

// Resolve an AtomSpec entry to its constructor, cache key, and optional role.
function resolveAtomSpec(methodName: string, entry: AtomSpec) {
	const Ctor = typeof entry === 'function' ? entry : entry.atom;
	const key = typeof entry === 'function' ? methodName : (entry.key ?? methodName);
	const role = typeof entry === 'function' ? undefined : entry.role;
	return { Ctor, key, role };
}

// Project a spec's atoms map onto an AtomRegistry (key → factory).
function buildAtomRegistry(atomsSpec: Record<string, AtomSpec>): AtomRegistry {
	const registry: AtomRegistry = {};
	for (const methodName of Object.keys(atomsSpec)) {
		const { Ctor, key, role } = resolveAtomSpec(methodName, atomsSpec[methodName]!);
		registry[key] = (bond) => {
			const atom = new Ctor(bond);
			return role ? atom.role(role) : atom;
		};
	}
	return registry;
}

// Attach a cached bond.methodName() accessor that delegates to bond.atom(key).
function attachAccessor(proto: object, methodName: string, key: string) {
	Object.defineProperty(proto, methodName, {
		value(this: Bond) {
			return (this as Bond).atom(key);
		},
		writable: true,
		configurable: true,
		enumerable: false
	});
}

// Attach a non-atom method to the prototype.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function attachMethod(proto: object, name: string, fn: (...args: any[]) => any) {
	Object.defineProperty(proto, name, {
		value: fn,
		writable: true,
		configurable: true,
		enumerable: false
	});
}

// Build a concrete Bond subclass from a spec — cached factory per atom slot, own CONTEXT_KEY, inherited static get/set.
export function defineBond<
	A extends Record<string, AtomSpec>,
	State extends BondState<BondStateProps> = BondState,
	Base extends BondBaseClass = typeof Bond,
	PAtoms extends Record<string, AtomSpec> = Record<never, AtomSpec>,
	PState extends BondState = BondState,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	M extends Record<string, (...args: any[]) => any> = Record<never, never>
>(
	// `extends`/`methods` omitted from BondSpec then re-added so they're the sole inference sites for M/PAtoms.
	spec: Omit<BondSpec<A, Base>, 'extends' | 'methods'> & {
		extends?: DefinedBondClass<PAtoms, PState>;
		methods?: M;
	}
): DefinedBondClass<Omit<PAtoms, keyof A> & A, State, Base, M> {
	// ─── Flat composition path (`parts:`) — the compose operator (ADR 0004 Decision 1) ───
	if (spec.parts && spec.parts.length > 0) {
		const partsAtoms: Record<string, AtomSpec> = {};
		const partsCapFns: ((state: BondState) => Capability[])[] = [];
		for (const part of spec.parts) {
			Object.assign(partsAtoms, part.spec.atoms);
			if (part.spec.capabilities) partsCapFns.push(part.spec.capabilities);
		}
		const mergedAtoms = { ...partsAtoms, ...spec.atoms };
		const mergedCapabilities = (state: BondState): Capability[] => [
			...partsCapFns.flatMap((fn) => fn(state)),
			...(spec.capabilities?.(state) ?? [])
		];

		const BaseClass = (spec.base ?? Bond) as unknown as new (
			state: BondState,
			name?: string
		) => Bond;

		class Composed extends BaseClass {
			// Fully-merged spec — the seam a future parts: [ThisBond] reads.
			static spec = {
				...spec,
				atoms: mergedAtoms,
				capabilities: mergedCapabilities
			} as unknown as BondSpec<Record<string, AtomSpec>>;

			// Shared atom tier, built once: base registry + merged parts atoms (own wins).
			static atoms: AtomRegistry = {
				...(BaseClass as unknown as typeof Bond).atoms,
				...buildAtomRegistry(mergedAtoms)
			};

			constructor(state: State) {
				super(state, spec.name);
				for (const cap of mergedCapabilities(state)) this.capability(cap);
			}

			override get namespace(): string {
				return spec.name;
			}

			override get preset(): string {
				return spec.preset ?? super.preset;
			}
		}

		// Fresh context key — `parts:` is a rebrand, not an extension.
		Object.defineProperty(Composed, 'CONTEXT_KEY', {
			value: bondContextKey(spec.name),
			writable: true,
			configurable: true
		});

		// Transitive keys: a part contributes its full CONTEXT_KEYS, so e.g. a `<Popover.Trigger>`
		// inside a Select still resolves via `PopoverBond.get()`.
		const partContextKeys = [
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			...new Set(
				spec.parts.flatMap((p) =>
					p.CONTEXT_KEYS ? [...p.CONTEXT_KEYS] : [p.CONTEXT_KEY ?? bondContextKey(p.spec.name)]
				)
			)
		];
		// Publish own + transitive keys for the next composition.
		Object.defineProperty(Composed, 'CONTEXT_KEYS', {
			value: [bondContextKey(spec.name), ...partContextKeys],
			writable: true,
			configurable: true
		});
		// `share()` also registers under each part's key so parts' own atom components resolve.
		const proto = Composed.prototype as unknown as { share: () => Bond };
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

		// Accessors for all merged atoms (no prototype chain to inherit from).
		for (const methodName of Object.keys(mergedAtoms)) {
			const { key } = resolveAtomSpec(methodName, mergedAtoms[methodName]!);
			attachAccessor(Composed.prototype, methodName, key);
		}
		for (const [name, fn] of Object.entries(spec.methods ?? {})) {
			attachMethod(Composed.prototype, name, fn);
		}

		return Composed as unknown as DefinedBondClass<Omit<PAtoms, keyof A> & A, State, Base, M>;
	}

	// ─── Spec-inheritance path (`extends:`) — a real subclass; kept for the positioned chain ───
	const parent = spec.extends as unknown as
		| (DefinedBondClass<Record<string, AtomSpec>, BondState> & {
				spec: BondSpec<Record<string, AtomSpec>>;
		  })
		| undefined;
	const BaseClass = (spec.extends ?? spec.base ?? Bond) as unknown as new (
		state: BondState,
		name?: string
	) => Bond;

	class Defined extends BaseClass {
		// Flattened spec (own merged over parent's) — the seam fuse / nested extends reads.
		static spec = (parent
			? {
					...spec,
					atoms: { ...parent.spec.atoms, ...spec.atoms },
					capabilities: (state: BondState) => [
						...(parent.spec.capabilities?.(state) ?? []),
						...(spec.capabilities?.(state) ?? [])
					]
				}
			: spec) as unknown as BondSpec<Record<string, AtomSpec>>;

		// Shared atom tier, built once: parent/base registry + own atoms (own wins, §13.1).
		static atoms: AtomRegistry = {
			...(BaseClass as unknown as typeof Bond).atoms,
			...buildAtomRegistry(spec.atoms)
		};

		constructor(state: State) {
			// Parent ctor is `(state)` (already registered its capabilities); a raw base takes the name.
			// Either way `name` drives the namespace via the getter, not the ctor arg.
			if (parent) super(state);
			else super(state, spec.name);
			for (const capability of spec.capabilities?.(state) ?? []) this.capability(capability);
		}

		override get namespace(): string {
			return spec.name;
		}

		override get preset(): string {
			return spec.preset ?? super.preset;
		}
	}

	// Own CONTEXT_KEY only when not extending — a child inherits the parent's, keeping the family unified.
	if (!spec.extends) {
		Object.defineProperty(Defined, 'CONTEXT_KEY', {
			value: bondContextKey(spec.name),
			writable: true,
			configurable: true
		});
	}

	// Attach only own atom accessors; the parent's are inherited via the prototype (own overrides, last-wins).
	for (const methodName of Object.keys(spec.atoms)) {
		const { key } = resolveAtomSpec(methodName, spec.atoms[methodName]!);
		attachAccessor(Defined.prototype, methodName, key);
	}
	for (const [name, fn] of Object.entries(spec.methods ?? {})) {
		attachMethod(Defined.prototype, name, fn);
	}

	return Defined as unknown as DefinedBondClass<Omit<PAtoms, keyof A> & A, State, Base, M>;
}
