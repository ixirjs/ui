import { getContext, setContext } from 'svelte';
import { DEV } from 'esm-env';
import { NodeRegistry, type LazyNodeDescriptor, type LazyNodePlan } from './node-registry.svelte';
import { bondContextKey } from './context';
import { Atom } from './atom.svelte';
import { CapabilityRegistry } from './capability-registry';
import { BOND_BRAND, generateId, ordinaryHasInstance } from './identity';
export { BOND_BRAND } from './identity';
import type {
	BondClass,
	BondStateProps as BondPropsBase,
	BondVirtualElement,
	NodeRegistrationOptions
} from './types';

export abstract class Bond<Props extends BondPropsBase = BondPropsBase> extends CapabilityRegistry {
	static CONTEXT_KEY = bondContextKey('bond');

	#bindingManaged = false;
	#id: string;
	#props: Props;
	#name: string;
	#nodes = new NodeRegistry(this);
	// Role lookup is intentionally first-match-wins; warn once if a supposedly unique role is ambiguous.
	// Allocate the diagnostic set only for Bonds that actually encounter ambiguity.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#roleWarnings: Set<string> | undefined;

	constructor(props: Props = {} as Props, name?: string) {
		super();
		this.#props = (props ?? {}) as Props;
		this.#id = this.#props.id ?? generateId();
		this.#name = name ?? '';
	}

	/** @internal Whether server teardown is owned wholesale by this Bond's binding. */
	get __bindingManaged(): boolean {
		return this.#bindingManaged;
	}

	set __bindingManaged(value: boolean) {
		this.#bindingManaged = value;
	}

	get id() {
		return this.props?.id ?? this.#id;
	}

	get props() {
		return this.#props;
	}

	get name() {
		return this.#name;
	}

	// Bonds print as [object <name>] in consoles and Object.prototype.toString.
	get [Symbol.toStringTag]() {
		return this.name;
	}

	get namespace(): string {
		return this.name;
	}

	get preset(): string {
		return this.namespace;
	}

	/** Resolve one root-owned descendant slot's presentation layer. */
	presetLayer(slot: string) {
		return this.props.presets?.[slot];
	}

	share(): this {
		const key = (this.constructor as typeof Bond).CONTEXT_KEY;
		return setContext(key, this);
	}

	get elements() {
		const obj: Record<string, Element | BondVirtualElement | undefined> = {};
		for (const entry of this.#nodes.elementValues()) obj[entry.key] = entry.element;
		return obj;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	register<N extends Atom<any, any>>(node: N, options: NodeRegistrationOptions = {}): () => void {
		return this.#nodes.register(node, options);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	unregister(node: Atom<any, any>): void {
		this.#nodes.unregister(node);
	}

	/** @internal Register semantic identity without constructing its Atom. */
	registerLazyNode<N extends Atom>(plan: LazyNodePlan<N>): LazyNodeDescriptor<N> {
		return this.#nodes.registerLazy(plan, this);
	}

	/** @internal Remove a lazy semantic identity whether or not it materialized. */
	unregisterLazyNode(descriptor: LazyNodeDescriptor): void {
		this.#nodes.unregisterLazy(descriptor);
	}

	/** @internal Relationship projection lookup that does not materialize a lazy Atom. */
	nodeIdByRole(role: string): string | undefined {
		return this.#nodes.idByRole(role);
	}

	/** Exact registration-part lookup. */
	nodeByPart<N extends Atom = Atom>(part: string): N | undefined {
		return this.#nodes.nodeByPart<N>(part);
	}

	/** Exact registration-part lookup for repeated parts. */
	nodesByPart<N extends Atom = Atom>(part: string): N[] {
		return this.#nodes.nodesByPart<N>(part);
	}

	/**
	 * Exact role lookup; roles do not share the part/name namespace.
	 *
	 * The first registered matching Atom is returned. A role is normally unique within a Bond;
	 * duplicate matches are a composition error and produce one DEV diagnostic per role while
	 * preserving the deterministic first-match behavior for compatibility.
	 */
	nodeByRole<N extends Atom = Atom>(role: string): N | undefined {
		const first = this.#nodes.nodeByRole<N>(role);
		if (DEV && first && !this.#roleWarnings?.has(role)) {
			const duplicate = this.#nodes.nodesByRole<N>(role)[1];
			if (duplicate) {
				(this.#roleWarnings ??= new Set()).add(role);
				console.warn(
					`[ixirjs] Bond("${this.name}").nodeByRole("${role}") matched multiple Atoms; returning the first registered Atom "${first.name}" and ignoring "${duplicate.name}".`
				);
			}
		}
		return first;
	}

	destroy() {
		try {
			this.destroyCapabilities();
		} finally {
			this.#nodes.clear();
			this.#roleWarnings?.clear();
		}
	}

	static get<T extends Bond>(this: BondClass<T>): T | undefined {
		return getContext<T | undefined>(this.CONTEXT_KEY);
	}

	/**
	 * `get()` outside a component initialisation (`getContext` throws there), for a Bond that reads
	 * its own optional parent — nesting. Three families each wrote this try/catch by hand.
	 */
	static getOptional<T extends Bond>(this: BondClass<T>): T | undefined {
		try {
			return getContext<T | undefined>(this.CONTEXT_KEY);
		} catch {
			return undefined;
		}
	}

	static getOrThrow<T extends Bond>(this: BondClass<T>, message?: string): T {
		const bond = getContext<T | undefined>(this.CONTEXT_KEY);
		if (!bond) {
			throw new Error(
				message ?? '[ixirjs] Bond context missing: component must be used within its provider.'
			);
		}
		return bond;
	}

	static [Symbol.hasInstance](this: unknown, value: unknown): boolean {
		if (this === Bond) {
			return value != null && typeof value === 'object' && BOND_BRAND in value;
		}
		return ordinaryHasInstance(this, value);
	}
}

// Cross-copy identity brand, read by `[Symbol.hasInstance]` above via `in` — which walks the
// prototype chain, so one prototype-level definition brands every instance. The previous
// per-instance `defineProperty` in the constructor forced a hidden-class transition on every Bond
// construction. Duplicate package copies brand their own prototype with the same registered
// symbol (`Symbol.for`), so cross-copy `instanceof` is unchanged.
Object.defineProperty(Bond.prototype, BOND_BRAND, { value: true });
