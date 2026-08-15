import type { Atom } from '$ixirjs/ui/shared/bond/atom.svelte';
import type { Bond } from '$ixirjs/ui/shared/bond/bond.svelte';
import {
	bindBond,
	connectControlledProps,
	type BondBinding,
	type BondBindingOptions,
	type BondFactory,
	type PropsSpec
} from '$ixirjs/ui/shared/bond/bind.svelte';
import { createAtomInstance } from '$ixirjs/ui/shared/bond/use-atom.svelte';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset/types';
import type { AtomInstance, AtomsOf, SpecOf } from './define.svelte';
import { createPartAtom, resolveBondPart } from './metadata';

/**
 * The root counterpart of {@link Kernel.node}.
 *
 * A root owns five things that every family root previously wired by hand: the props cells, the
 * Bond, its context publication, the root Atom, and that Atom's registration. All five are already
 * determined by the definition — `defineBond({ atoms: { root: { atom, role } } })` names the root
 * Atom constructor, its registration key, and its role — so the root component was restating
 * authoring metadata the backbone already holds. `useRoot` is the one place that resolves it.
 *
 * The result satisfies `Kernel.element`'s seam directly:
 *
 * ```ts
 * const root = useRoot(CardBond, propsSpec, { preset: () => preset, id: () => ID, factory });
 * const el = Kernel.element(root, () => ({ ...root.props, ...restProps }));
 * ```
 *
 * Every member is a getter, so passing `root` into Kernel allocates no compatibility packet and
 * adds no signal. Roots that must *replace* a composed handler keep building the packet by hand with
 * `mergeAtomProps(root.atom, preset, { ...root.props, ...restProps })`; nothing was removed.
 */

// Recovers the Bond instance type from a definition's construct signature. `defineBond` returns a
// constructible facade, and a raw Bond subclass is constructible too, so both shapes resolve here.
type BondOfDefinition<D> = D extends abstract new (...args: never[]) => infer B
	? B extends Bond
		? B
		: Bond
	: Bond;

// `BondFactory<B> = (props: PropsOf<B>) => B`; PropsOf is private to bind.svelte, so recover the
// props type through the factory rather than duplicating its inference chain.
type BondPropsOf<B extends Bond> = Parameters<BondFactory<B>>[0];

// The root Atom declared by the definition's spec. Falls back to the base Atom for a definition
// with no authoring metadata (a hand-written Bond class), which must supply `options.atom`.
type RootAtomOf<D> = [SpecOf<D>] extends [never]
	? Atom
	: AtomsOf<SpecOf<D>> extends { root: infer Declared }
		? AtomInstance<Declared>
		: Atom;

// Structurally what `defineBond` produces. Kept loose so a raw Bond subclass still type-checks.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RootDefinition = abstract new (...args: any[]) => Bond;

export type UseRootOptions<B extends Bond, N extends Atom> = {
	/** The declared slot to resolve the root Atom from. Roots are `root` by convention. */
	slot?: string;
	/**
	 * Bond construction. Defaults to the definition's own static `create(props)` — every
	 * `defineBond` result has one — falling back to `new Definition(props)`.
	 *
	 * A getter, like `preset` and `id`, so a root forwards its consumer-facing `factory` prop as
	 * `factory: () => factory` — no local default to declare (the fallback below already is one) and
	 * no `state_referenced_locally` warning from reading a prop outside a closure.
	 */
	factory?: () => BondFactory<B> | undefined;
	/**
	 * The component's `preset` prop. Wins over `atom.preset`, exactly as for a part. Typed as
	 * `unknown` to match `UsePartOptions.preset`: a consumer may name a preset this build does not
	 * know about, and the resolver already tolerates an unknown key.
	 */
	preset?: () => unknown;
	/**
	 * `presets` is a root-owned map addressed by slot name, and a root resolves its own entry the
	 * same way every descendant part does — `bond.presetLayer(slot)`. Pass this only to deviate:
	 * `false` suppresses the layer, a getter supplies one directly.
	 */
	presetLayer?: boolean | (() => PresetLike | undefined);
	/** The component identity seed — always `$props.id()` from the owning root. */
	id?: () => string | undefined;
	/** Static defaults spread once into the props base; reactive props belong in the props spec. */
	base?: () => Partial<BondPropsOf<B>>;
	/**
	 * Explicit root Atom construction, for a definition whose spec declares no `root` slot.
	 *
	 * `false` declares a root that owns a Bond but renders no element of its own — `Select.Root`,
	 * `Popover.Root`, `Form.Root`. Such a root has no Atom, no preset key and no preset layer, so
	 * the result carries only the Bond, its props and the binding.
	 */
	atom?: false | ((bond: B) => N);
	/**
	 * Runs after the Bond is constructed, its capabilities are activated and it is published to
	 * context, and before the root Atom is created. This is the ordering a controlled prop needs:
	 * it must adopt its owner late enough that construction-time writes stay silent, and early
	 * enough that an Atom's setup writes are reported.
	 */
	connect?: (bond: B) => void;
};

/**
 * The result of an element-less root (`atom: false`): the Bond, its props, and the binding.
 *
 * This is the shape `bindBond` callers assembled by hand — bind, share, adopt the controlled
 * cells, re-export `getBond`. Naming it here makes the two root shapes one seam with one option
 * rather than two functions distinguished by a prose rule.
 */
export type UsedBondRoot<B extends Bond> = {
	readonly bond: B;
	readonly props: Record<string, unknown>;
	readonly binding: BondBinding<B>;
	getBond(): B;
};

export type UsedRoot<B extends Bond, N extends Atom> = {
	readonly bond: B;
	readonly atom: N;
	/** The slot this root was resolved from. The single source of truth for the slot string. */
	readonly slot: string;
	readonly preset: PresetKey | undefined;
	readonly presetLayer: PresetLike | undefined;
	/**
	 * The Bond's reactive props, minus the root-owned `presets` map, plus the Bond itself. Spread
	 * before `restProps` so a consumer's own props still win; presentation reads them as variant
	 * inputs, which is how state-reactive presets select on root state.
	 */
	readonly props: Record<string, unknown>;
	/** The underlying binding, for a root that needs the preset-carrying props or the raw cells. */
	readonly binding: BondBinding<B>;
	/**
	 * The instance accessor a root re-exports as its own `getBond()` — assign it, don't rebuild it:
	 * `export const getBond = root.getBond;`. It is a plain arrow over the shared Bond with no
	 * `this`, so it survives being handed out. Twenty-seven roots wrote `() => bond` instead, which
	 * is the same function allocated a second time per root instance.
	 */
	getBond(): B;
};

export function useRoot<const D extends RootDefinition, B extends Bond = BondOfDefinition<D>>(
	definition: D,
	props: PropsSpec<BondPropsOf<B>>,
	options: UseRootOptions<B, RootAtomOf<D>> & { atom: false }
): UsedBondRoot<B>;
export function useRoot<const D extends RootDefinition, B extends Bond = BondOfDefinition<D>>(
	definition: D,
	props: PropsSpec<BondPropsOf<B>>,
	options?: UseRootOptions<B, RootAtomOf<D>>
): UsedRoot<B, RootAtomOf<D>>;
export function useRoot(
	definition: RootDefinition,
	props: PropsSpec<object>,
	options: UseRootOptions<Bond, Atom> = {}
	// Runtime is intentionally broad; the overloads above preserve the definition-derived interface.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UsedRoot<any, Atom> | UsedBondRoot<any> {
	const slot = options.slot ?? 'root';

	// `bindBond`'s options are declared with exactOptionalPropertyTypes, so an absent getter must be
	// absent rather than explicitly undefined.
	const bindingOptions: BondBindingOptions<Bond> = {};
	// The cast, not a wrapper closure: the getter is forwarded as-is, and the unknown → PresetKey
	// narrowing is a type-level statement the old per-root arrow restated at runtime cost.
	if (options.preset) bindingOptions.preset = options.preset as () => PresetKey | undefined;
	if (options.base) bindingOptions.base = options.base;
	if (options.id) bindingOptions.id = options.id;

	const binding = bindBond<Bond>(
		options.factory?.() ?? defaultBondFactory(definition),
		props as PropsSpec<Parameters<BondFactory<Bond>>[0]>,
		bindingOptions
	);

	// Publish before the Atom is created: the root Atom and every descendant resolve the Bond from
	// context, and the root's own capabilities may register during construction.
	const bond = binding.bond.share();
	// Controlled props declare their own adoption; discharge it here, in the one window that is
	// correct for it, before any hand-written `connect` runs.
	connectControlledProps(props, bond);
	options.connect?.(bond);

	// An element-less root owns a Bond and nothing else: no Atom, no registration, no preset key.
	if (options.atom === false) return new BondRoot(bond, binding);

	// An explicit `atom` factory belongs to the root; otherwise the declaration owns construction,
	// exactly as it does for a descendant part.
	const construct = options.atom;
	const atom = construct
		? createAtomInstance<Atom, Bond>(slot, {
				bond,
				required: true,
				factory: (owner) => construct(owner as Bond)
			})
		: createPartAtom(resolveBondPart(definition, slot), bond, true);

	return new ElementRoot(bond, binding, atom, slot, options);
}

/**
 * The two root results are classes, not object literals, so their accessors live on one shared
 * prototype instead of being installed per rendered root.
 *
 * An object literal carrying getters is not a plain data object: V8 builds it with accessor
 * descriptors, which is materially more work than storing fields into a known shape. `useRoot` was
 * 6.1% of the bare-root layer's SSR self time, most of it here. This is the same trade that was
 * measured and rejected for `KernelElement` — but the two are not the same case: KernelElement's
 * methods are called several times per element by the renderer, so a
 * prototype hop is paid repeatedly, whereas a root's accessors are read once or twice per render
 * and the construction saving dominates.
 *
 * `getBond` stays an own arrow field: roots re-export it (`export const getBond = root.getBond;`),
 * so it must survive being detached from the instance.
 */
class BondRoot<B extends Bond> implements UsedBondRoot<B> {
	readonly bond: B;
	readonly binding: BondBinding<B>;
	readonly getBond: () => B;

	constructor(bond: B, binding: BondBinding<B>) {
		this.bond = bond;
		this.binding = binding;
		this.getBond = () => bond;
	}

	get props(): Record<string, unknown> {
		return this.binding.stateProps;
	}
}

class ElementRoot<B extends Bond, N extends Atom> implements UsedRoot<B, N> {
	readonly bond: B;
	readonly binding: BondBinding<B>;
	readonly atom: N;
	readonly slot: string;
	readonly getBond: () => B;
	readonly #options: UseRootOptions<B, N>;

	constructor(
		bond: B,
		binding: BondBinding<B>,
		atom: N,
		slot: string,
		options: UseRootOptions<B, N>
	) {
		this.bond = bond;
		this.binding = binding;
		this.atom = atom;
		this.slot = slot;
		this.#options = options;
		this.getBond = () => bond;
	}

	get preset(): PresetKey | undefined {
		return (this.#options.preset?.() ?? this.atom.preset) as PresetKey | undefined;
	}

	get presetLayer(): PresetLike | undefined {
		const layer = this.#options.presetLayer;
		if (layer === undefined || layer === true) return this.bond.presetLayer(this.slot);
		if (layer === false) return undefined;
		return layer();
	}

	get props(): Record<string, unknown> {
		return this.binding.stateProps;
	}
}

// `defineBond` attaches a static `create(props)` to every definition; a hand-written Bond subclass
// has none and is constructed directly. The factory is a per-definition constant — the property
// probe and the closure used to run per rendered root, so the answer is cached and shared.
const bondFactories = new WeakMap<object, BondFactory<Bond>>();

function defaultBondFactory(definition: object): BondFactory<Bond> {
	const cached = bondFactories.get(definition);
	if (cached) return cached;

	const create = (definition as { create?: (props: never) => Bond }).create;
	const factory: BondFactory<Bond> =
		typeof create === 'function'
			? (props) => create.call(definition, props as never)
			: (props) => new (definition as unknown as new (props: unknown) => Bond)(props);
	bondFactories.set(definition, factory);
	return factory;
}
