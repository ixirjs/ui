import { onDestroy, untrack } from 'svelte';
import { BROWSER } from 'esm-env';
import { Atom } from './atom.svelte';
import type { Bond } from './bond.svelte';
import type { BondVirtualElement, NodeRegistrationOptions } from './types';
import type {
	AnyCapabilitySurface,
	AtomCapability,
	CapabilitySetupResult
} from '$ixirjs/ui/shared/capability';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAtom = Atom<any, any>;

// `activateCapabilities`'s own default parameter is `[]`, which allocates once per rendered element
// for the no-capability case. Pass the shared empty list instead.
const EMPTY_BEFORE_SETUPS = Object.freeze([]) as readonly (() => CapabilitySetupResult)[];

export type AtomCapabilityEntry<
	N extends AnyAtom = Atom,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> =
	| ((node: N, bond: B | undefined) => Disposable | (() => void) | void)
	| AtomCapability<AnyCapabilitySurface, N, B, E>;

export type CreateAtomInstanceOptions<
	N extends AnyAtom = Atom,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> = {
	/** Plain one-shot input. Resolver names make one-shot lazy resolution explicit. */
	resolveKey?: () => string;
	bond?: B | undefined;
	resolveBond?: () => B | undefined;
	required?: boolean | string;
	register?: boolean | NodeRegistrationOptions;
	factory?: (bond: B | undefined, key: string) => N;
	capabilities?: readonly AtomCapabilityEntry<N, B, E>[];
	namespace?: string;
	preset?: string;
	id?: string;
};

export function createAtomInstance<
	N extends AnyAtom = Atom,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(key: string | undefined, options: CreateAtomInstanceOptions<N, B, E> = {}): N {
	const resolvedKey = options.resolveKey ? options.resolveKey() : key;
	if (resolvedKey === undefined) throw new Error('[ixirjs] createAtomInstance requires a key.');
	const bond = options.resolveBond ? options.resolveBond() : options.bond;
	const required = options.required ?? false;
	const requiredMessage = typeof required === 'string' ? required : undefined;

	if (required && !bond) {
		throw new Error(
			requiredMessage ??
				`[ixirjs] Atom("${resolvedKey}") requires a Bond context but none was provided.`
		);
	}

	const node = untrack(() =>
		options.factory
			? options.factory(bond, resolvedKey)
			: (new Atom(bond, resolvedKey, {
					...(options.namespace !== undefined ? { namespace: options.namespace } : {}),
					...(options.preset !== undefined ? { preset: options.preset } : {}),
					...(options.id !== undefined ? { id: options.id } : {})
				}) as unknown as N)
	);

	// Almost every rendered part declares no atom capabilities at all. The previous shape allocated
	// an initializer array unconditionally and then mapped it into a second array of closures — two
	// allocations per rendered element — to hand `activateCapabilities` an empty list it discards on
	// its own fast path. Build the list only when a capability is actually declared.
	const declared = options.capabilities;
	let beforeSetups: Array<() => CapabilitySetupResult> | undefined;
	if (declared) {
		for (const capability of declared) {
			if (typeof capability === 'function') {
				(beforeSetups ??= []).push(() => capability(node, bond));
			} else {
				node.capability(capability as AtomCapability<unknown, Atom, Bond, E>);
			}
		}
	}

	// Registration is the first owned resource. Atom capability setup runs only after the Bond can
	// resolve the atom, then teardown reverses that sequence (capabilities before registration).
	const unregister =
		bond && options.register !== false
			? bond.register(node, options.register === true ? undefined : options.register)
			: undefined;

	try {
		node.activateCapabilities(bond, beforeSetups ?? EMPTY_BEFORE_SETUPS);
	} catch (error) {
		unregister?.();
		throw error;
	}

	if (!BROWSER) {
		// SSR has no per-Atom capability effects. One callback per Bond restores every registration
		// before render() returns without making Svelte retain a destroy callback for each Atom.
		// Binding-managed bonds skip even that: their BondBinding's own teardown clears the whole
		// registry, so a per-atom batch would only repeat work per rendered part. The batch remains
		// for externally-owned bonds (constructed outside the render and reused across renders),
		// where it is what keeps a second render from tripping single-cardinality registration.
		if (bond && unregister && !bindingManagedBonds.has(bond)) {
			scheduleSsrUnregister(bond, unregister);
		}
	} else {
		onDestroy(() => {
			const errors: unknown[] = [];
			try {
				node.destroyCapabilities();
			} catch (error) {
				errors.push(error);
			}
			try {
				unregister?.();
			} catch (error) {
				errors.push(error);
			}
			if (errors.length > 0) {
				throw new AggregateError(errors, `[ixirjs] Atom("${node.name}") disposal failed.`);
			}
		});
	}

	return node;
}

const ssrUnregisterBatches = new WeakMap<Bond, Array<() => void>>();

// Bonds whose SSR teardown a BondBinding owns wholesale (bond.destroy() → registry clear).
const bindingManagedBonds = new WeakSet<Bond>();

/** Called by BondBinding on the server so bonded atoms skip the redundant unregister batch. */
export function markBindingManaged(bond: Bond): void {
	bindingManagedBonds.add(bond);
}

function scheduleSsrUnregister(bond: Bond, unregister: () => void): void {
	const pending = ssrUnregisterBatches.get(bond);
	if (pending) {
		pending.push(unregister);
		return;
	}

	const batch = [unregister];
	ssrUnregisterBatches.set(bond, batch);
	onDestroy(() => {
		ssrUnregisterBatches.delete(bond);
		const errors: unknown[] = [];
		for (let index = batch.length - 1; index >= 0; index--) {
			try {
				batch[index]!();
			} catch (error) {
				errors.push(error);
			}
		}
		if (errors.length > 0) {
			throw new AggregateError(errors, '[ixirjs] SSR Atom registration disposal failed.');
		}
	});
}
