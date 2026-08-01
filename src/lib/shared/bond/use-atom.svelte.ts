import { onDestroy, untrack } from 'svelte';
import { Atom } from './atom.svelte';
import type { Bond } from './bond.svelte';
import type { BondVirtualElement, NodeRegistrationOptions } from './types';
import type { AtomCapability } from '../capability';

type MaybeGetter<T> = T | (() => T);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAtom = Atom<any, any>;

function resolve<T>(value: MaybeGetter<T>): T {
	return typeof value === 'function' ? (value as () => T)() : value;
}

function toTeardown(live: Disposable | (() => void)): () => void {
	if (typeof live === 'function') return live;
	return () => live[Symbol.dispose]();
}

export type AtomCapabilityEntry<
	N extends AnyAtom = Atom,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> =
	| ((node: N, bond: B | undefined) => Disposable | (() => void) | void)
	| AtomCapability<unknown, N, B, E>;

export type CreateAtomInstanceOptions<
	N extends AnyAtom = Atom,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> = {
	bond?: MaybeGetter<B | undefined>;
	required?: MaybeGetter<boolean | string>;
	register?: boolean | NodeRegistrationOptions;
	factory?: (bond: B | undefined, key: string) => N;
	capabilities?: MaybeGetter<readonly AtomCapabilityEntry<N, B, E>[]>;
	namespace?: string;
	preset?: string;
	id?: string;
};

export function createAtomInstance<
	N extends AnyAtom = Atom,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(key: MaybeGetter<string>, options: CreateAtomInstanceOptions<N, B, E> = {}): N {
	const resolvedKey = resolve(key);
	const bond = options.bond ? resolve(options.bond) : undefined;
	const required = options.required ? resolve(options.required) : false;
	const requiredMessage = typeof required === 'string' ? required : undefined;

	if (required && !bond) {
		throw new Error(
			requiredMessage ??
				`[svelte-atoms] Atom("${resolvedKey}") requires a Bond context but none was provided.`
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

	const teardowns: Array<() => void> = [];

	for (const capability of options.capabilities ? resolve(options.capabilities) : []) {
		if (typeof capability === 'function') {
			const live = capability(node, bond);
			if (live) teardowns.push(toTeardown(live));
			continue;
		}

		node.capability(capability as AtomCapability<unknown, Atom, Bond, E>);

		const live = capability.setup?.(node, bond);
		if (live) teardowns.push(toTeardown(live));
	}

	if (bond && options.register !== false) {
		const registrationOptions = options.register === true ? undefined : options.register;
		teardowns.push(bond.register(node, registrationOptions));
	}

	if (teardowns.length > 0) {
		onDestroy(() => {
			for (let i = teardowns.length - 1; i >= 0; i--) teardowns[i]!();
		});
	}

	return node;
}
