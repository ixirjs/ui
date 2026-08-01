import { nanoid } from 'nanoid';
import { DEV } from 'esm-env';
import { Collection } from './collection.svelte';
import { collectionCapability, collectionSlot } from '../capability/models/collection.svelte';
import { slotName } from '../capability/capability';
import type { BondStateProps } from './types';
import type { Behavior, Capability, CapabilityInfo, CapabilityKey } from '../capability/capability';

/**
 * Compatibility state host for legacy Bond authoring.
 *
 * @deprecated New components should author shared state directly on a `Bond`
 * subclass or use `defineBond({ state })` as a compatibility bridge. `BondState`
 * remains available for existing user code during the vNext migration window.
 */
export abstract class BondState<S extends BondStateProps = BondStateProps> {
	#id: string;
	#props: S;
	// Single home for capabilities; collections also live here at slot collection:<kind>.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#capabilities: Capability<any>[] = [];
	// Slot index mirrors #capabilities for O(1) lookup while preserving projection order.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#capabilitySlots = new Map<symbol, number>();

	constructor(props: S, id: string = nanoid(8)) {
		this.#props = props;
		this.#id = id;
	}

	get id() {
		return this.props?.id ?? this.#id;
	}

	get props() {
		return this.#props;
	}

	collection<T>(kind: string): Collection<T> {
		const slot = collectionSlot(kind);
		// Read the registry directly (not via `capability(slot)`) so a first, cache-priming
		// access doesn't trip the "no capability at this slot" DEV warning.
		const existing = this.#findCapability(slot);
		if (existing) return existing.surface as Collection<T>;
		const cap = collectionCapability<T>(kind);
		this.capability(cap);
		return cap.surface;
	}

	capability<C extends Capability>(capability: C): C;
	capability<S>(key: CapabilityKey<S>): Capability<S> | undefined;
	capability<S = unknown>(
		capabilityOrKey: Capability | CapabilityKey<S>
	): Capability<S> | undefined {
		if (typeof capabilityOrKey === 'symbol') {
			const found = this.#findCapability(capabilityOrKey) as Capability<S> | undefined;
			if (DEV && !found) {
				console.warn(
					`[svelte-atoms] BondState.capability("${slotName(capabilityOrKey)}"): no capability registered at this slot in "${this.id}".`
				);
			}
			return found;
		}
		// Last-wins-per-slot: re-registering a slot replaces the prior holder (lets a spec override a
		// base default; `fuse` and the overlay capability stacks rely on it). A holder carrying a
		// `compose` hook instead WRAPS the prior — the registry hands it the capability it supersedes
		// so it can delegate (decorateCapability). DEV-logs either way so overrides aren't silent.
		// Slot identity is by symbol, not string.
		const i = this.#capabilitySlots.get(capabilityOrKey.slot) ?? -1;
		if (i >= 0) {
			const prior = this.#capabilities[i]!;
			const next = capabilityOrKey.compose ? capabilityOrKey.compose(prior) : capabilityOrKey;
			if (DEV) {
				const verb = capabilityOrKey.compose ? 'decorated' : 'replaced';
				console.debug(
					`[svelte-atoms] capability slot "${slotName(capabilityOrKey.slot)}" ${verb} in "${this.id}" (last-wins).`
				);
			}
			this.#capabilities[i] = next;
		} else {
			this.#capabilitySlots.set(capabilityOrKey.slot, this.#capabilities.length);
			this.#capabilities.push(capabilityOrKey);
		}
		return capabilityOrKey as Capability<S>;
	}

	// Bare registry lookup by slot identity — no DEV warn. Shared by capability()/collection()/require*.
	#findCapability(slot: symbol): Capability | undefined {
		const i = this.#capabilitySlots.get(slot);
		return i === undefined ? undefined : this.#capabilities[i];
	}

	surface<S>(key: CapabilityKey<S>): S | undefined {
		return this.capability(key)?.surface;
	}

	// Throws with the slot name (skips the DEV warn).
	requireCapability<S>(key: CapabilityKey<S>): Capability<S> {
		const found = this.#findCapability(key) as Capability<S> | undefined;
		if (!found) {
			throw new Error(
				`[svelte-atoms] required capability "${slotName(key)}" is not registered in "${this.id}".`
			);
		}
		return found;
	}

	requireSurface<S>(key: CapabilityKey<S>): S {
		const cap = this.requireCapability(key);
		if (cap.surface === undefined) {
			throw new Error(
				`[svelte-atoms] capability "${slotName(key)}" has no surface in "${this.id}".`
			);
		}
		return cap.surface;
	}

	// Set by useCapabilities() once it has run the registered setups.
	#setupConsumed = false;
	markSetupConsumed(): void {
		this.#setupConsumed = true;
	}

	get capabilities(): readonly Capability[] {
		return this.#capabilities;
	}

	describeCapabilities(): CapabilityInfo[] {
		return this.#capabilities.map((c) => ({
			slot: c.slot,
			description: c.slot.description,
			...(c.meta ? { meta: c.meta } : {}),
			hasSurface: c.surface !== undefined,
			requires: c.requires ?? [],
			hasSetup: typeof c.setup === 'function'
		}));
	}

	// Deferred to first projection so the full constructor-time registration order is complete.
	// Checks: (a) requires slots are registered, (b) useCapabilities ran if any cap has setup().
	// Timing: real roots call useCapabilities before children project, so (b) only fires when genuinely missing.
	#validated = false;
	#validate() {
		// Plain local Set: built once for membership lookup below, never reactive state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const slots = new Set(this.#capabilities.map((c) => c.slot));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const slotOwners = new Map(this.#capabilities.map((c) => [c.slot, c]));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const roleOwners = new Map<string, Capability[]>();
		for (const cap of this.#capabilities) {
			for (const role of cap.meta?.projects ?? []) {
				const owners = roleOwners.get(role);
				if (owners) owners.push(cap);
				else roleOwners.set(role, [cap]);
			}
		}
		for (const cap of this.#capabilities) {
			for (const need of cap.requires ?? []) {
				if (!slots.has(need)) {
					console.warn(
						`[svelte-atoms] capability "${slotName(cap.slot)}" requires slot "${slotName(need)}", which is not registered in "${this.id}".`
					);
				}
			}
			for (const conflict of cap.meta?.conflicts ?? []) {
				if (typeof conflict === 'symbol') {
					const owner = slotOwners.get(conflict);
					if (owner && owner !== cap) {
						console.warn(
							`[svelte-atoms] capability "${slotName(cap.slot)}" conflicts with registered capability slot "${slotName(conflict)}" in "${this.id}".`
						);
					}
					continue;
				}

				const owners = roleOwners.get(conflict)?.filter((owner) => owner !== cap) ?? [];
				if (owners.length > 0) {
					console.warn(
						`[svelte-atoms] capability "${slotName(cap.slot)}" conflicts with role "${conflict}" projected by ${owners.map((owner) => `"${slotName(owner.slot)}"`).join(', ')} in "${this.id}".`
					);
				}
			}
		}
		if (!this.#setupConsumed && this.#capabilities.some((c) => c.setup)) {
			console.warn(
				`[svelte-atoms] "${this.id}" registered capabilities with setup() (focus/escape/…) but useCapabilities(bond) was never called — their whole-bond effects will not run.`
			);
		}
	}

	behaviorsForRole(role: string, ctx?: unknown): Behavior[] {
		if (DEV && !this.#validated) {
			this.#validated = true;
			this.#validate();
		}
		const out: Behavior[] = [];
		for (const capability of this.#capabilities) {
			const behavior = capability.behavior?.(role, ctx);
			if (behavior) out.push(behavior);
		}
		return out;
	}
}
