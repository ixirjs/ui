import { DEV } from 'esm-env';
import { normalizeCapability, slotName } from './capability';
import type { CapabilityEnvelope, CapabilityMetadata, CapabilitySetupResult } from './capability';
import { CapabilityRuntime } from './runtime.svelte';
import type { RuntimeCapability, RuntimeMessages } from './runtime.svelte';

/**
 * The one implementation of everything a capability host does around {@link CapabilityRuntime}.
 *
 * Bond and Atom are two hosts of the same concept, and each used to carry its own copy of the
 * registration guard, the six runtime error-message factories, and the DEV validation walk —
 * roughly 250 lines saying the same three rules twice, in two shapes that had already drifted.
 *
 * What genuinely differs between the two hosts is *wording*, not logic. So the control flow lives
 * here once and the strings are selected by `kind`. Every message below is byte-identical to the
 * one its host emitted before, because those strings are asserted by
 * `lifecycle.svelte.spec.ts` and `atom.svelte.spec.ts`.
 */
export type HostKind = 'bond' | 'atom';

/** How a host names itself in a diagnostic: a Bond by id, an Atom by `Atom("name")`. */
export type HostLabel = () => string;

// ─── Runtime error messages ───────────────────────────────────────────────────

/** Diagnostic name for one capability. */
function capabilityLabel(capability: RuntimeCapability): string {
	return slotName(capability.slot);
}

function quoted(capabilities: readonly RuntimeCapability[]): string {
	return capabilities.map((capability) => `"${capabilityLabel(capability)}"`).join(' -> ');
}

// Two shared frozen tables replace the per-host closure sets: this factory used to allocate six
// message closures (plus a helper and the carrying object) for every Bond and every
// capability-bearing Atom — for strings only ever read on error paths. The host label now travels
// as a call argument instead of being closed over. Every message stays byte-identical to the one
// its host emitted before (asserted by `lifecycle.svelte.spec.ts` and `atom.svelte.spec.ts`).
const BOND_RUNTIME_MESSAGES: RuntimeMessages<RuntimeCapability> = Object.freeze({
	missingRequirement: (label, capability, requirement) =>
		`[ixirjs] capability "${capabilityLabel(capability)}" requires slot "${slotName(requirement)}", which is not registered in "${label()}".`,
	cycle: (label, capabilities) =>
		`[ixirjs] capability setup dependency cycle in "${label()}": ${quoted(capabilities)}.`,
	alreadyActive: (label) =>
		`[ixirjs] capabilities for "${label()}" are already active; exactly one lifecycle owner is allowed.`,
	disposed: (label) =>
		`[ixirjs] capabilities for "${label()}" were disposed and cannot be activated again.`,
	disposalFailed: (label) => `[ixirjs] capability disposal failed in "${label()}".`,
	activationFailed: (label) => `[ixirjs] capability activation failed in "${label()}".`
});

const ATOM_RUNTIME_MESSAGES: RuntimeMessages<RuntimeCapability> = Object.freeze({
	missingRequirement: (label, capability, requirement) =>
		`[ixirjs] Atom("${label()}") capability "${capabilityLabel(capability)}" requires slot "${slotName(requirement)}", which is not registered.`,
	cycle: (label, capabilities) =>
		`[ixirjs] atom capability setup dependency cycle on Atom("${label()}"): ${quoted(capabilities)}.`,
	alreadyActive: (label) =>
		`[ixirjs] capabilities for Atom("${label()}") are already active; exactly one lifecycle owner is allowed.`,
	disposed: (label) =>
		`[ixirjs] capabilities for Atom("${label()}") were disposed and cannot be activated again.`,
	disposalFailed: (label) => `[ixirjs] atom capability disposal failed on Atom("${label()}").`,
	activationFailed: (label) => `[ixirjs] atom capability activation failed on Atom("${label()}").`
});

export function capabilityRuntimeMessages<C extends RuntimeCapability>(
	kind: HostKind
): RuntimeMessages<C> {
	// Messages only read `capability.slot`, so widening the table's C to the caller's is safe.
	return (kind === 'bond' ? BOND_RUNTIME_MESSAGES : ATOM_RUNTIME_MESSAGES) as RuntimeMessages<C>;
}

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * The shape both hosts' descriptors share: an envelope that may compose over a prior one.
 * `Self` closes the loop — a descriptor composes over its own type, which is what lets
 * `registerCapability` type the composition instead of erasing it.
 */
export type ComposableCapability<Self = unknown> = CapabilityEnvelope &
	RuntimeCapability & {
		compose?: (prior: Self) => Self;
	};

/**
 * Register one capability on a host: brand check, seal guard, last-wins replacement through
 * `compose`, and the DEV replaced/composed notice.
 *
 * Returns the descriptor actually stored — which is the composed result when a decorator replaced
 * a prior registration, not the descriptor that was passed in.
 */
export function registerCapability<C extends ComposableCapability<C>>(
	runtime: CapabilityRuntime<C, unknown>,
	capability: C,
	options: CapabilityHostOptions
): C {
	const { kind, label } = options;
	const descriptor = normalizeCapability(capability, kind);
	const noun = kind === 'bond' ? 'capability' : 'atom capability';
	const name = () => slotName(descriptor.slot);

	if (runtime.isSealed) {
		throw new Error(
			kind === 'bond'
				? `[ixirjs] cannot register capability "${name()}" in "${label()}" after activation or role projection.`
				: `[ixirjs] cannot register atom capability "${name()}" after Atom("${label()}") setup.`
		);
	}

	const prior = runtime.find(descriptor.slot);

	const registered = runtime.register(descriptor, (current, next) =>
		next.compose ? normalizeCapability(next.compose(current), kind, next.slot) : next
	);

	if (DEV && prior) {
		const verb = capability.compose ? 'composed' : 'replaced';
		console.debug(
			kind === 'bond'
				? `[ixirjs] capability slot "${slotName(capability.slot)}" ${verb} in "${label()}" (last-wins).`
				: `[ixirjs] Atom("${label()}") ${noun} "${slotName(capability.slot)}" ${verb}.`
		);
	}

	return registered;
}

// ─── DEV validation ───────────────────────────────────────────────────────────

type ValidatableCapability = RuntimeCapability & {
	readonly meta?: CapabilityMetadata;
	readonly setup?: unknown;
};

export interface CapabilityValidation {
	/** Structural rules. Final the moment they are asked, so a host may latch them. */
	readonly messages: string[];
	/** Present when some capability registered `setup()`; only true once the turn has settled. */
	readonly inactiveLifecycle?: string;
}

/**
 * The three composition rules, checked once for either host: every `requires` slot is registered,
 * no declared conflict is present, and a host that registered `setup()` actually ran its lifecycle.
 *
 * The lifecycle rule is returned apart from the others because it is the only one whose answer can
 * still change: `bindBond` activates inside its own constructor, and an Atom's spread is built
 * during render but its capabilities set up at mount. Both hosts therefore defer it by a
 * microtask, while latching the structural verdict immediately.
 *
 * Returns messages rather than warning directly so the caller controls emission.
 */
export function capabilityValidationMessages(
	kind: HostKind,
	label: HostLabel,
	capabilities: readonly ValidatableCapability[]
): CapabilityValidation {
	const bond = kind === 'bond';
	const subject = bond ? '' : `Atom("${label()}") `;
	const messages: string[] = [];

	// Plain local diagnostic indexes, never reactive state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const slotOwners = new Map<symbol, ValidatableCapability>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const projectionOwners = new Map<string, ValidatableCapability[]>();
	let hasSetup = false;

	for (const capability of capabilities) {
		slotOwners.set(capability.slot, capability);
		for (const projection of capability.meta?.projects ?? []) {
			const owners = projectionOwners.get(projection);
			if (owners) owners.push(capability);
			else projectionOwners.set(projection, [capability]);
		}
		if (capability.setup) hasSetup = true;
	}

	for (const capability of capabilities) {
		const self = capabilityLabel(capability);

		for (const need of capability.requires ?? []) {
			if (slotOwners.has(need)) continue;
			messages.push(
				bond
					? `[ixirjs] capability "${self}" requires slot "${slotName(need)}", which is not registered in "${label()}".`
					: `[ixirjs] ${subject}capability "${self}" requires slot "${slotName(need)}", which is not registered.`
			);
		}

		for (const conflict of capability.meta?.conflicts ?? []) {
			if (typeof conflict === 'symbol') {
				const owner = slotOwners.get(conflict);
				if (!owner || owner === capability) continue;
				messages.push(
					bond
						? `[ixirjs] capability "${self}" conflicts with registered capability slot "${slotName(conflict)}" in "${label()}".`
						: `[ixirjs] ${subject}capability "${self}" conflicts with registered atom capability slot "${slotName(conflict)}".`
				);
				continue;
			}

			const owners = projectionOwners.get(conflict)?.filter((owner) => owner !== capability) ?? [];
			if (owners.length === 0) continue;
			const names = owners.map((owner) => `"${capabilityLabel(owner)}"`).join(', ');
			messages.push(
				bond
					? `[ixirjs] capability "${self}" conflicts with role "${conflict}" projected by ${names} in "${label()}".`
					: `[ixirjs] ${subject}capability "${self}" conflicts with projection "${conflict}" from ${names}.`
			);
		}
	}

	if (!hasSetup) return { messages };

	return {
		messages,
		inactiveLifecycle: bond
			? `[ixirjs] "${label()}" registered capabilities with setup() but its lifecycle was never activated — use bindBond() from the owning root.`
			: `[ixirjs] Atom("${label()}") registered atom capabilities with setup() but activateCapabilities() was never called — their atom setup effects will not run.`
	};
}

// ─── The host itself ──────────────────────────────────────────────────────────

/**
 * The empty-slot diagnostic for `capability(key)`. A free function rather than a method because an
 * Atom that never registered a capability has no host to ask, and must not allocate one to report
 * that the slot is empty.
 */
export function warnMissingCapability(kind: HostKind, label: HostLabel, slot: symbol): void {
	if (!DEV) return;
	console.warn(
		kind === 'bond'
			? `[ixirjs] capability("${slotName(slot)}"): no capability registered at this slot in "${label()}".`
			: `[ixirjs] Atom("${label()}").capability("${slotName(slot)}"): no atom capability registered.`
	);
}

export type CapabilityHostOptions = {
	kind: HostKind;
	label: HostLabel;
};

// Bond passes two arguments; the shared list keeps the no-op case allocation-free.
const NO_BEFORE_SETUPS = Object.freeze([]) as readonly (() => CapabilitySetupResult)[];

/**
 * A capability host: one {@link CapabilityRuntime} plus the registration guard and the DEV
 * validation latch that every host wraps it in.
 *
 * `Bond` (through `CapabilityRegistry`) and `Atom` each used to own that wrapper themselves — the
 * same lazy runtime, the same `#validated` flag, the same register-then-invalidate step, the same
 * microtask-deferred lifecycle warning, written twice. Only four things actually differ between
 * them: the host kind, how it names itself, and what it hands `setup()`. Wording and descriptor
 * normalization both follow `kind`, exactly as the message tables above do.
 *
 * What deliberately stayed with the hosts is what genuinely diverges: `requireSurface` (a Bond
 * distinguishes an unregistered slot from a surface-less one, an Atom does not), `behaviorsForRole`
 * and `collection` (Bond-only), and the lazy allocation policy — an Atom creates its host on first
 * registration, a Bond always has one.
 */
export class CapabilityHost<C extends ComposableCapability<C>, Owner> {
	readonly #runtime: CapabilityRuntime<C, Owner>;
	readonly #options: CapabilityHostOptions;
	#validated = false;

	constructor(options: CapabilityHostOptions) {
		this.#options = options;
		this.#runtime = new CapabilityRuntime<C, Owner>(
			capabilityRuntimeMessages<C>(options.kind),
			options.label
		);
	}

	get capabilities(): readonly C[] {
		return this.#runtime.capabilities;
	}

	get isActive(): boolean {
		return this.#runtime.isActive;
	}

	/** Whether activation left a lifecycle owner to destroy. See {@link CapabilityRuntime.hasTeardown}. */
	get hasTeardown(): boolean {
		return this.#runtime.hasTeardown;
	}

	find(slot: symbol): C | undefined {
		return this.#runtime.find(slot);
	}

	/** The lookup behind each host's public `capability(key)` accessor. */
	findOrWarn(slot: symbol): C | undefined {
		const found = this.#runtime.find(slot);
		if (!found) warnMissingCapability(this.#options.kind, this.#options.label, slot);
		return found;
	}

	/**
	 * The register-or-look-up body behind both hosts' `capability(...)` overload pair, which is one
	 * function distinguished only by whether its argument is a symbol.
	 */
	registerOrFind(capabilityOrKey: C | symbol): C | undefined {
		return typeof capabilityOrKey === 'symbol'
			? this.findOrWarn(capabilityOrKey)
			: this.register(capabilityOrKey);
	}

	/** The registered surface at `slot`, if any. Warns on an empty slot, as `capability(key)` does. */
	surface(slot: symbol): unknown {
		return this.findOrWarn(slot)?.surface;
	}

	/** The capability at `slot`, or a throw. Bond-only: an Atom reports an empty slot as a warning. */
	require(slot: symbol): C {
		const found = this.#runtime.find(slot);
		if (!found) {
			throw new Error(
				`[ixirjs] required capability "${slotName(slot)}" is not registered in "${this.#options.label()}".`
			);
		}
		return found;
	}

	/**
	 * The surface at `slot`, or a throw naming which rule failed. A Bond distinguishes an
	 * unregistered slot from a registered-but-surface-less one; an Atom reports the second wording
	 * for both, which is what it did before this moved here.
	 */
	requireSurface(slot: symbol): unknown {
		const { kind, label } = this.#options;
		const surface = kind === 'bond' ? this.require(slot).surface : this.surface(slot);
		if (surface !== undefined) return surface;
		throw new Error(
			kind === 'bond'
				? `[ixirjs] capability "${slotName(slot)}" has no surface in "${label()}".`
				: `[ixirjs] required atom capability "${slotName(slot)}" has no surface on Atom("${label()}").`
		);
	}

	/** Registers and reopens validation. Returns the stored descriptor, composed where it composed. */
	register(capability: C): C {
		const registered = registerCapability(this.#runtime, capability, this.#options);
		this.#validated = false;
		return registered;
	}

	order(): readonly C[] {
		return this.#runtime.order();
	}

	seal(): void {
		this.#runtime.seal();
	}

	markActive(): void {
		this.#runtime.markActive();
	}

	activate(
		owner: Owner,
		setup: (capability: C, owner: Owner) => CapabilitySetupResult,
		beforeSetups: readonly (() => CapabilitySetupResult)[] = NO_BEFORE_SETUPS
	): void {
		this.#runtime.activate(owner, setup, beforeSetups);
	}

	destroy(): void {
		this.#runtime.destroy();
	}

	/**
	 * Emits the DEV composition rules once per registration set. The lifecycle rule is deferred a
	 * microtask because both hosts ask before their own activation runs — a Bond projects a role
	 * while still constructing, an Atom builds its spread during render and sets up at mount.
	 */
	validate(): void {
		if (!DEV || this.#validated) return;
		this.#validated = true;
		const { messages, inactiveLifecycle } = capabilityValidationMessages(
			this.#options.kind,
			this.#options.label,
			this.#runtime.capabilities
		);
		for (const message of messages) console.warn(message);
		if (!inactiveLifecycle || this.#runtime.isActive) return;
		queueMicrotask(() => {
			if (!this.#runtime.isActive) console.warn(inactiveLifecycle);
		});
	}
}
