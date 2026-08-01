import type { NodeCardinality, NodeRegistrationOptions } from '$ixirjs/ui/shared/bond';
import type { AtomConstructor, AtomSpec, BondSpec } from './define.svelte';

// Composition is authoring-runtime metadata, not a definition's public contract.
type InternalSpec = BondSpec<Record<string, AtomSpec>>;
const specs = new WeakMap<object, InternalSpec>();

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
	const resolved = Object.freeze({
		name: spec.name,
		Ctor: typeof entry === 'function' ? entry : entry.atom,
		part,
		role: typeof entry === 'function' ? undefined : entry.role,
		cardinality,
		registration: Object.freeze({ key: part, cardinality })
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
