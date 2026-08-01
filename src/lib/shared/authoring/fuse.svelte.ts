import type { BondState, Capability } from '../bond';
import {
	defineBond,
	type AtomSpec,
	type BondSpec,
	type DefinedBondClass,
	type FusablePart,
	type StateCtor
} from './define.svelte';

export type AtomsOf<P> = P extends { readonly spec: BondSpec<infer A> } ? A : Record<string, never>;

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
	name: string;
	parts: Parts;
	atoms?: Own;
	capabilities?: (state: State) => Capability[];
	preset?: string;
	// Generic State keeps explicit args so State threads precisely (e.g. SelectBond).
	state?: StateCtor<State>;
}

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
		...(spec.preset ? { preset: spec.preset } : {}),
		...(spec.state ? { state: spec.state as StateCtor<State> } : {})
	}) as unknown as DefinedBondClass<MergeAtoms<Parts> & Own, State>;
}
