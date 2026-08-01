import type { BondState, Capability } from './bond.svelte';
import {
	defineBond,
	type AtomSpec,
	type BondSpec,
	type DefinedBondClass,
	type FusablePart
} from './define-bond.svelte';

// Fusion (§9): typed wrapper over defineBond({ parts: ... }). Atoms union (later wins); capabilities concatenate.
// name rebrands (fresh namespace/preset/CONTEXT_KEY); share() also registers under each part's key.

// Extract the atom map A from a fusable part (via its spec).
export type AtomsOf<P> = P extends { readonly spec: BondSpec<infer A> }
	? A
	: Record<string, never>;

// Merge the atom maps of a tuple of bonds (later parts override on key collision).
export type MergeAtoms<Parts extends readonly FusablePart[]> = Parts extends readonly [
	infer Head,
	...infer Tail
]
	? Tail extends readonly FusablePart[]
		? AtomsOf<Head> & MergeAtoms<Tail>
		: AtomsOf<Head>
	: Record<string, never>;

export interface FuseSpec<
	Parts extends readonly FusablePart[],
	Own extends Record<string, AtomSpec>,
	State extends BondState
> {
	// Rebrand identity for the fused bond — namespace, preset base, context key.
	name: string;
	// The bonds to fuse. Atoms union (later wins on key); capabilities concatenate.
	parts: Parts;
	// Extra atoms only the fusion adds (win over part atoms on key collision).
	atoms?: Own;
	// Extra capabilities the fusion adds, on top of the parts'.
	capabilities?: (state: State) => Capability[];
	// Override the dotted preset base.
	preset?: string;
}

// Typed entry point for flat composition; infers MergeAtoms<Parts> and delegates to defineBond.
export function fuse<
	const Parts extends readonly FusablePart[],
	Own extends Record<string, AtomSpec> = Record<string, never>,
	State extends BondState = BondState
>(spec: FuseSpec<Parts, Own, State>): DefinedBondClass<MergeAtoms<Parts> & Own, State> {
	return defineBond<MergeAtoms<Parts> & Own, State>({
		name: spec.name,
		parts: spec.parts as readonly FusablePart[],
		atoms: (spec.atoms ?? {}) as MergeAtoms<Parts> & Own,
		...(spec.capabilities
			? { capabilities: spec.capabilities as (state: BondState) => Capability[] }
			: {}),
		...(spec.preset ? { preset: spec.preset } : {})
	}) as unknown as DefinedBondClass<MergeAtoms<Parts> & Own, State>;
}
