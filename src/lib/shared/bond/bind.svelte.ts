import { onDestroy, untrack } from 'svelte';
import { BROWSER } from 'esm-env';
import type { Bond } from './bond.svelte';
import { markBindingManaged } from './use-atom.svelte';
import type { BondStateProps } from './types';
import type { PresetKey } from '$ixirjs/ui/preset/types';

// Extracts the props type from a Bond; props-owned defineBond bases are inferred directly.
type PropsOf<B extends Bond> = B extends { readonly __props?: infer P }
	? P
	: B extends { readonly props: infer P }
		? P
		: B extends Bond<infer P>
			? P
			: BondStateProps;

// Builds a bond from its assembled props cell object (the component's factory).
export type BondFactory<B extends Bond> = (props: PropsOf<B>) => B;

type Getter<V> = () => V;
type Setter<V> = (value: V) => void;

export type ControlledPropContext<B> = Record<string, unknown> & { bond: B };
export type ControlledPropOptions<V, B> = {
	get: Getter<V>;
	set: Setter<V>;
	onchange?: (value: V, context: ControlledPropContext<B>) => void;
	context?: (bond: B) => Omit<ControlledPropContext<B>, 'bond'>;
	equals?: (left: V, right: V) => boolean;
	notifyWhen?: () => boolean;
};

/**
 * Owns the writable-derived bridge required by a controlled `$bindable` prop.
 * The cell commits locally first, writes upstream second, then reports the committed value.
 * Parent-driven echoes only update the derived input and never invoke `onchange`.
 */
function controlledCell<V, B extends Bond>(options: ControlledPropOptions<V, B>) {
	let value = $derived.by(options.get);
	let owner: B | undefined;
	const equals = options.equals ?? Object.is;

	const cell: [Getter<V>, Setter<V>] = [
		() => value,
		(next) => {
			const changed = !equals(value, next);
			value = next;
			options.set(next);
			if (!changed || !owner || !options.onchange || options.notifyWhen?.() === false) return;
			// Re-read after the upstream assignment: Svelte may proxy an assigned array/object,
			// and the callback contract exposes the exact committed value visible on Bond props.
			options.onchange(value, { bond: owner, ...options.context?.(owner) });
		}
	];

	return {
		cell,
		connect(bond: B): B {
			owner = bond;
			return bond;
		},
		get value(): V {
			return value;
		}
	};
}

/**
 * A controlled prop: the writable-derived bridge and its owner adoption in one declaration.
 *
 * A `ControlledProp` IS a `PropCell` — a real `[getter, setter]` tuple — so it goes straight into
 * the props spec, and it carries its own `connect`. `useRoot` adopts every controlled prop in the
 * spec at the one moment in the lifecycle where that is correct (after the Bond is shared, before
 * the root Atom exists), so the obligation is discharged by the seam that owns the ordering rather
 * than restated by each root. Forgetting it used to be silent: the binding still worked and
 * `onchange` simply never fired.
 */
export type ControlledProp<V = unknown, B extends Bond = Bond> = [Getter<V>, Setter<V>] & {
	connect(bond: B): B;
	readonly value: V;
};

const CONTROLLED_PROP = Symbol('ixirjs.controlledProp');

/**
 * The tuple stays a plain `Array` with three own non-enumerable properties. Making it an `Array`
 * subclass with `connect`, `value` and the brand on the prototype is 17x cheaper to construct
 * (0.058 µs against 0.99 µs — three `defineProperties` entries demote an array out of its
 * elements-only shape) and is nevertheless a net loss, measured end to end against a 1.3% null-A/B
 * floor: `tree` fell from -5.1% to -3.7% and `card`, which owns no controlled prop at all, went
 * from -1.0% to +3.9%.
 *
 * The reason it reaches a family that never constructs one is that `assembleProps` and
 * `connectControlledProps` walk every root's props spec. A second array shape flowing through them
 * makes those shared sites polymorphic, and that costs every Bond on the page more than the saving
 * returns to the few roots that declare a controlled prop. Construction here happens once per root;
 * the spec walk happens for all of them.
 */
export function controlledProp<V, B extends Bond = Bond>(
	options: ControlledPropOptions<V, B>
): ControlledProp<V, B> {
	const controlled = controlledCell<V, B>(options);
	const prop = [controlled.cell[0], controlled.cell[1]] as ControlledProp<V, B>;
	// Non-enumerable so the tuple still reads as a plain two-element cell everywhere it is spread,
	// destructured, or length-checked.
	Object.defineProperties(prop, {
		[CONTROLLED_PROP]: { value: true },
		connect: { value: (bond: B) => controlled.connect(bond) },
		value: { get: () => controlled.value }
	});
	return prop;
}

/** Whether a props-spec entry carries its own owner adoption. */
function isControlledProp(cell: unknown): cell is ControlledProp {
	return Array.isArray(cell) && CONTROLLED_PROP in cell;
}

/**
 * Adopt every controlled prop declared in a props spec. Called by `useRoot` after the Bond is
 * shared and before the root Atom is created — the window a controlled prop requires so that
 * construction-time writes stay silent and Atom setup writes are reported.
 */
export function connectControlledProps<P extends object>(spec: PropsSpec<P>, bond: Bond): void {
	for (const key in spec) {
		if (!Object.hasOwn(spec, key)) continue;
		const cell = spec[key];
		if (isControlledProp(cell)) cell.connect(bond);
	}
}

// Optional Object.defineProperty descriptor flags for a cell (rarely needed).
export type CellConfig = Pick<PropertyDescriptor, 'enumerable' | 'configurable'>;

// One reactive prop cell: () => V (read-only), [getter, setter] (read/write), or [getter, setter, CellConfig].
export type PropCell<V> = Getter<V> | [Getter<V>, Setter<V>] | [Getter<V>, Setter<V>, CellConfig];

// Per-field accessor spec for a bond's props: each field is a PropCell wired to $state/$bindable.
export type PropsSpec<P extends object> = {
	[K in keyof P]?: PropCell<P[K]>;
};

export type BondBindingOptions<B extends Bond = Bond> = {
	// Getter for the component's preset prop; wins over atom.preset when non-nullish.
	preset?: () => PresetKey | undefined;
	// Static defaults / restProps spread once into the props base. Reactive props belong in the props spec (see ADR 0002).
	base?: () => Partial<PropsOf<B>>;
	// Component-scoped identity seed, always `$props.id()` from the owning root. Defined
	// non-enumerable so it never reaches the DOM through `stateProps` / `bond.props` spreads:
	// Atoms derive element ids from it via getElementId, and a consumer's own `id` prop still
	// wins per-element through restProps. A root that declares `id` in its props spec keeps that.
	id?: () => string | undefined;
};

// Assemble cells in one pass. The former definer pipeline allocated three intermediate arrays
// and one closure per prop before installing the same descriptors.
//
// Collecting the descriptors into a map and handing it to `Object.create` was measured as the
// alternative — one hidden-class transition instead of several, and no `delete` to demote the
// object to dictionary mode. It is 57% SLOWER at this shape (two cells plus the id seed): V8
// validates and converts every descriptor object on that path, which costs more than the
// transitions it avoids. Keep the incremental form; `bind-props.svelte.spec.ts` pins the
// descriptor semantics either way.
function assembleProps<P extends object>(
	spec: PropsSpec<P>,
	base: (() => Partial<P>) | undefined
): P {
	const assembled = (base ? { ...base() } : {}) as P;
	for (const key in spec) {
		if (!Object.hasOwn(spec, key)) continue;
		const cell = spec[key];
		if (cell == null) continue;
		// Branch instead of normalizing into a tuple: the `[cell]` wrapper and the `{ set }`/config
		// spreads allocated three throwaway objects per prop on every root render.
		let get: Getter<unknown>;
		let set: Setter<unknown> | undefined;
		let config: CellConfig | undefined;
		if (Array.isArray(cell)) {
			get = cell[0] as Getter<unknown>;
			set = cell[1] as Setter<unknown> | undefined;
			config = cell[2] as CellConfig | undefined;
		} else {
			get = cell as Getter<unknown>;
		}
		if (key in assembled) delete (assembled as Record<string, unknown>)[key];
		const descriptor: PropertyDescriptor = { get, enumerable: true };
		if (set) descriptor.set = set;
		if (config) {
			if (config.enumerable !== undefined) descriptor.enumerable = config.enumerable;
			if (config.configurable !== undefined) descriptor.configurable = config.configurable;
		}
		Object.defineProperty(assembled, key, descriptor);
	}
	return assembled;
}

// Assembles props and builds the bond in untrack; spreading atomProps + restProps gives preset→spread→rest precedence.
export class BondBinding<B extends Bond = Bond> {
	readonly bond: B;
	readonly #props: PropsOf<B>;
	readonly #presetGetter: (() => PresetKey | undefined) | undefined;
	#stateProps: Record<string, unknown> | undefined;

	constructor(
		factory: BondFactory<B>,
		props: PropsSpec<PropsOf<B>>,
		options?: BondBindingOptions<B>
	) {
		const assembled = assembleProps<PropsOf<B>>(props, options?.base);
		if (options?.id && !Object.hasOwn(assembled, 'id')) {
			Object.defineProperty(assembled, 'id', {
				get: options.id,
				enumerable: false,
				configurable: true
			});
		}
		this.#props = assembled;
		this.bond = untrack(() => factory(assembled));
		this.#presetGetter = options?.preset;

		// This destroy clears the bond's whole node registry at SSR teardown, so bonded atoms
		// skip their per-atom unregister batch (see use-atom.svelte.ts). Server-only bookkeeping.
		if (!BROWSER) markBindingManaged(this.bond);

		// bindBond assembles props and owns activation/destruction. The component explicitly
		// publishes the Bond with binding.bond.share() at its context boundary.
		this.bond.activateCapabilities(this.bond);
		onDestroy(() => this.bond.destroy());
	}

	get preset() {
		return this.#presetGetter?.();
	}

	get props() {
		const preset = this.preset;
		return { preset, bond: this.bond, ...this.#props };
	}

	get stateProps() {
		// Built once, not per read. `#props` is assembled from accessor cells whose KEY SET is fixed
		// at construction, so the projection can mirror it with getters and stay live — where the
		// former destructure-rest + re-spread snapshotted values and therefore had to rebuild on
		// every read. Roots read this on each render (and again through the element seam), so the
		// old shape allocated two objects per root per render to describe a fixed set of keys.
		//
		// Bond-owned presentation maps are consumed through bond.presetLayer(), never forwarded to
		// the DOM — `presets` is excluded here rather than read-and-discarded, which also keeps it
		// from registering as a dependency of whoever spreads this.
		if (this.#stateProps) return this.#stateProps;

		const props = this.#props as Record<string, unknown>;
		const out: Record<string, unknown> = { bond: this.bond };
		for (const key in props) {
			if (key === 'presets' || !Object.hasOwn(props, key)) continue;
			Object.defineProperty(out, key, {
				get: () => props[key],
				enumerable: true,
				configurable: true
			});
		}
		// Rest-destructure also carried own enumerable symbols (a base built from restProps can hold
		// attachment keys); preserve that. Symbol-keyed entries are static values, not cells.
		for (const sym of Object.getOwnPropertySymbols(props)) {
			if (Object.propertyIsEnumerable.call(props, sym)) {
				out[sym as unknown as string] = props[sym as unknown as string];
			}
		}
		return (this.#stateProps = out);
	}
}

export function bindBond<B extends Bond>(
	factory: BondFactory<B>,
	props: PropsSpec<PropsOf<B>>,
	options?: BondBindingOptions<B>
): BondBinding<B> {
	return new BondBinding(factory, props, options);
}
