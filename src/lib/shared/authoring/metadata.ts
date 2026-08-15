import type { Atom, Bond, NodeCardinality, NodeRegistrationOptions } from '$ixirjs/ui/shared/bond';
import type { LazyNodePlan } from '$ixirjs/ui/shared/bond/node-registry.svelte';
import { getElementId } from '$ixirjs/ui/utils/dom.svelte';
import { createAtomInstance } from '$ixirjs/ui/shared/bond/use-atom.svelte';
import type { AtomConstructor, AtomSpec, BondSpec } from './define.svelte';

// Composition is authoring-runtime metadata, not a definition's public contract.
type InternalSpec = BondSpec<Record<string, AtomSpec>>;
const specs = new WeakMap<object, InternalSpec>();

// Atom classes `defineBond` synthesized for a slot that declared no `atom` of its own. Recorded
// here rather than as a flag on the spec entry, so the authoring surface gains no field a family
// could set on a slot whose declared Atom actually carries attrs or handlers.
const synthesizedAtoms = new WeakSet<object>();

export function markSynthesizedAtom(ctor: object): void {
	synthesizedAtoms.add(ctor);
}

/** Localizes the unavoidable type-only specialization for generic component families. */
export function specializeDefinition<Facade>(definition: object): Facade {
	return definition as Facade;
}

export function setBondSpec(definition: object, spec: InternalSpec): void {
	specs.set(definition, spec);
}

export function getBondSpec(definition: object): InternalSpec {
	const spec = specs.get(definition);
	if (!spec) throw new Error('[ixirjs] Bond definition has no authoring metadata.');
	return spec;
}

export type ResolvedBondPart = {
	readonly name: string;
	readonly Ctor: AtomConstructor;
	readonly part: string;
	readonly role: string | undefined;
	readonly cardinality: NodeCardinality;
	/** Pre-built registration options — `bond.register` takes the same object every render. */
	readonly registration: NodeRegistrationOptions;
	/**
	 * A slot that declared neither `atom` nor `role` is presentation-only: its synthesized Atom
	 * contributes exactly `{ id }` to the spread, registers for nothing anything queries, and
	 * activates no capability. `definePart` renders such a part without constructing or
	 * registering the Atom at all. Contract note: an inert part is NOT visible through
	 * `bond.nodeByPart(...)` — a slot that needs querying declares an `atom` or a `role`.
	 */
	readonly inert: boolean;
	/** Immutable semantic plan used when Kernel registers the slot without constructing its Atom. */
	readonly nodePlan: LazyNodePlan;
};

// A part's declaration is fixed by its definition and slot: the constructor, registration key,
// role and cardinality all come from immutable authoring metadata. Resolving it built a fresh
// record on every rendered part — one of the hottest allocations on the per-part path — so the
// answer is computed once per (definition, slot) and shared.
const resolvedParts = new WeakMap<object, Map<string, ResolvedBondPart>>();

export function resolveBondPart(definition: object, slot: string): ResolvedBondPart {
	let bySlot = resolvedParts.get(definition);
	const cached = bySlot?.get(slot);
	if (cached) return cached;

	const spec = getBondSpec(definition);
	const entry = spec.atoms[slot];
	if (!entry) {
		throw new Error(`[ixirjs] Bond("${spec.name}") has no declared part "${slot}".`);
	}

	const part = typeof entry === 'function' ? slot : (entry.part ?? slot);
	const cardinality = typeof entry === 'function' ? 'single' : (entry.cardinality ?? 'single');
	const role = typeof entry === 'function' ? undefined : entry.role;
	const Ctor = typeof entry === 'function' ? entry : entry.atom;
	if (!Ctor)
		throw new Error(`[ixirjs] Bond("${spec.name}") part "${slot}" has no Atom constructor.`);
	const roles = Object.freeze(role ? [role] : []);
	const nodePlan: LazyNodePlan = Object.freeze({
		key: part,
		cardinality,
		roles,
		id: (bond: Bond) => getElementId(bond.id, `${spec.name}-${slot}`),
		create: (bond: Bond) => {
			const instance = new Ctor(bond);
			return role ? instance.role(role) : instance;
		}
	});
	const resolved = Object.freeze({
		name: spec.name,
		Ctor,
		part,
		role,
		cardinality,
		registration: Object.freeze({ key: part, cardinality }),
		inert: role === undefined && synthesizedAtoms.has(Ctor),
		nodePlan
	}) as ResolvedBondPart;

	if (!bySlot) {
		// Plain Map: definition-lifetime metadata index, never reactive state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		bySlot = new Map();
		resolvedParts.set(definition, bySlot);
	}
	bySlot.set(slot, resolved);
	return resolved;
}

/**
 * Construct the Atom a resolved part declares: its constructor, its registration options, and its
 * role projection. Kernel and `useRoot` both do exactly this — the root simply resolves its part
 * from the `root` slot — so the three facts the declaration owns are read in one place.
 */
export function createPartAtom(
	part: ResolvedBondPart,
	bond: Bond | undefined,
	required: boolean
): Atom {
	return createAtomInstance(part.part, {
		bond,
		required,
		// The resolved part owns this object; it is identical for every render of this slot.
		register: part.registration,
		factory: (owner) => {
			const instance = new part.Ctor(owner);
			return part.role ? instance.role(part.role) : instance;
		}
	});
}

/** Canonical missing-root message for Kernel-bound descendants. */
export function missingRootMessage(name: string, slot: string): string {
	const family = pascalCase(name);
	const article = /^[AEIOU]/.test(family) ? 'an' : 'a';
	return `[ixirjs] <${family}.${pascalCase(slot)} /> must be used within ${article} <${family}.Root />`;
}

function pascalCase(value: string): string {
	let out = '';
	for (const segment of value.split('-')) {
		if (segment) out += segment[0]!.toUpperCase() + segment.slice(1);
	}
	return out;
}
