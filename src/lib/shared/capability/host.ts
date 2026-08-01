import { DEV } from 'esm-env';
import { slotName } from './capability';
import type { CapabilityEnvelope, CapabilityMetadata } from './capability';
import type { CapabilityRuntime, RuntimeCapability } from './runtime.svelte';

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

type RuntimeMessages<C extends RuntimeCapability> = {
	missingRequirement: (capability: C, requirement: symbol) => string;
	cycle: (capabilities: readonly C[]) => string;
	alreadyActive: () => string;
	disposed: () => string;
	disposalFailed: () => string;
	activationFailed: () => string;
};

/** Diagnostic name for one capability. */
function capabilityLabel(capability: RuntimeCapability): string {
	return slotName(capability.slot);
}

export function capabilityRuntimeMessages<C extends RuntimeCapability>(
	kind: HostKind,
	label: HostLabel
): RuntimeMessages<C> {
	const quoted = (capabilities: readonly C[]) =>
		capabilities.map((capability) => `"${capabilityLabel(capability)}"`).join(' -> ');

	if (kind === 'bond') {
		return {
			missingRequirement: (capability, requirement) =>
				`[ixirjs] capability "${capabilityLabel(capability)}" requires slot "${slotName(requirement)}", which is not registered in "${label()}".`,
			cycle: (capabilities) =>
				`[ixirjs] capability setup dependency cycle in "${label()}": ${quoted(capabilities)}.`,
			alreadyActive: () =>
				`[ixirjs] capabilities for "${label()}" are already active; exactly one lifecycle owner is allowed.`,
			disposed: () =>
				`[ixirjs] capabilities for "${label()}" were disposed and cannot be activated again.`,
			disposalFailed: () => `[ixirjs] capability disposal failed in "${label()}".`,
			activationFailed: () => `[ixirjs] capability activation failed in "${label()}".`
		};
	}

	return {
		missingRequirement: (capability, requirement) =>
			`[ixirjs] Atom("${label()}") capability "${capabilityLabel(capability)}" requires slot "${slotName(requirement)}", which is not registered.`,
		cycle: (capabilities) =>
			`[ixirjs] atom capability setup dependency cycle on Atom("${label()}"): ${quoted(capabilities)}.`,
		alreadyActive: () =>
			`[ixirjs] capabilities for Atom("${label()}") are already active; exactly one lifecycle owner is allowed.`,
		disposed: () =>
			`[ixirjs] capabilities for Atom("${label()}") were disposed and cannot be activated again.`,
		disposalFailed: () => `[ixirjs] atom capability disposal failed on Atom("${label()}").`,
		activationFailed: () => `[ixirjs] atom capability activation failed on Atom("${label()}").`
	};
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

type RegisterOptions<C extends ComposableCapability<C>> = {
	kind: HostKind;
	label: HostLabel;
	/** Validates the descriptor's brand and, on composition, that it kept its slot. */
	normalize: (capability: C, expectedSlot?: symbol) => C;
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
	options: RegisterOptions<C>
): C {
	const { kind, label, normalize } = options;
	const descriptor = normalize(capability);
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
		next.compose ? normalize(next.compose(current), next.slot) : next
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
	const noun = bond ? 'capability' : 'capability';
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
					: `[ixirjs] ${subject}${noun} "${self}" requires slot "${slotName(need)}", which is not registered.`
			);
		}

		for (const conflict of capability.meta?.conflicts ?? []) {
			if (typeof conflict === 'symbol') {
				const owner = slotOwners.get(conflict);
				if (!owner || owner === capability) continue;
				messages.push(
					bond
						? `[ixirjs] capability "${self}" conflicts with registered capability slot "${slotName(conflict)}" in "${label()}".`
						: `[ixirjs] ${subject}${noun} "${self}" conflicts with registered atom capability slot "${slotName(conflict)}".`
				);
				continue;
			}

			const owners = projectionOwners.get(conflict)?.filter((owner) => owner !== capability) ?? [];
			if (owners.length === 0) continue;
			const names = owners.map((owner) => `"${capabilityLabel(owner)}"`).join(', ');
			messages.push(
				bond
					? `[ixirjs] capability "${self}" conflicts with role "${conflict}" projected by ${names} in "${label()}".`
					: `[ixirjs] ${subject}${noun} "${self}" conflicts with projection "${conflict}" from ${names}.`
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
