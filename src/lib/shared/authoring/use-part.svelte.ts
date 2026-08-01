import type { Atom } from '$ixirjs/ui/shared/bond/atom.svelte';
import type { Bond } from '$ixirjs/ui/shared/bond/bond.svelte';
import { createAtomInstance } from '$ixirjs/ui/shared/bond/use-atom.svelte';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset/types';
import { mergeAtomProps } from '$ixirjs/ui/shared/bond/presentation-props';
import {
	type AtomConstructor,
	type AtomInstance,
	type AtomsOf,
	type BondSpec,
	type SpecOf
} from './define.svelte';
import { resolveBondPart } from './metadata';

type PartKey<S extends BondSpec> = keyof AtomsOf<S> & string;
type PartAtom<S extends BondSpec, K extends PartKey<S>> = AtomInstance<AtomsOf<S>[K]>;
type AtomCtor<E> = E extends AtomConstructor
	? E
	: E extends { atom: infer C extends AtomConstructor }
		? C
		: never;
type OptionalPartKey<S extends BondSpec> = {
	[K in PartKey<S>]: undefined extends ConstructorParameters<AtomCtor<AtomsOf<S>[K]>>[0]
		? K
		: never;
}[PartKey<S>];

type PartProps = Record<string, unknown>;
type PartPropsInput = PartProps | (() => PartProps);
type PartDefinition = {
	get(): Bond | undefined;
	getOrThrow(message?: string): Bond;
};
type DefinitionBond<D extends PartDefinition> = ReturnType<D['getOrThrow']>;
type OptionalDefinitionBond<D extends PartDefinition> = ReturnType<D['get']>;

export type UsePartOptions = {
	/** Required context is the default. Optional mode is for explicitly bondless-capable parts. */
	context?: 'required' | 'optional';
	message?: string;
	preset?: () => unknown;
};

export type UsedPart<B, N extends Atom> = {
	readonly bond: B;
	readonly atom: N;
	/** The slot name this part was declared with. The single source of truth for the slot string. */
	readonly slot: string;
	/**
	 * The merged props packet: atom spread + rest props, with `preset`/`presetLayer` attached.
	 *
	 * Prefer the direct seam — `<HtmlAtom {...restProps} usedPart={part}>` — which renders through
	 * the native fast path without materializing this object.
	 *
	 * This packet remains the correct choice for a part that must **replace** a composed handler
	 * rather than add to it. Spreading it and then declaring `onclick={…}` after the spread
	 * overrides the merged handler outright, and the part can re-invoke `props.onclick` at the
	 * point it chooses. The direct seam instead *composes* the two (atom handler first), so those
	 * parts are not mechanically interchangeable. See `dialog-close.svelte` for the pattern.
	 *
	 * Lazy: leaving it unread costs nothing.
	 */
	readonly props: ReturnType<typeof mergeAtomProps>;
	/** The part's resolved preset key. */
	readonly preset: PresetKey | undefined;
	/** The bond's per-instance layer for this slot, resolved from the slot name the part declared. */
	readonly presetLayer: PresetLike | undefined;
};

export function usePart<const D extends PartDefinition, K extends PartKey<SpecOf<D>>>(
	definition: D,
	slot: K,
	restProps: PartPropsInput,
	options?: UsePartOptions & { context?: 'required' }
): UsedPart<DefinitionBond<D>, PartAtom<SpecOf<D>, K>>;
export function usePart<const D extends PartDefinition, K extends OptionalPartKey<SpecOf<D>>>(
	definition: D,
	slot: K,
	restProps: PartPropsInput,
	options: UsePartOptions & { context: 'optional' }
): UsedPart<OptionalDefinitionBond<D>, PartAtom<SpecOf<D>, K>>;
export function usePart(
	definition: object,
	slot: string,
	restProps: PartPropsInput,
	options: UsePartOptions = {}
	// Runtime is intentionally broad; overloads above preserve the definition-derived interface.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UsedPart<any, Atom> {
	const runtimeDefinition = definition as {
		get(): Bond | undefined;
		getOrThrow(message?: string): Bond;
	};
	const part = resolveBondPart(definition, slot);
	const optional = options.context === 'optional';
	// Read the context first and raise the error only when it is actually missing. Calling
	// `getOrThrow(message)` meant building that template literal on every rendered part to hand it
	// to a function that discards it whenever the root is present — which is every successful render.
	const bond = runtimeDefinition.get();
	if (!optional && !bond) {
		throw new Error(options.message ?? missingRootMessage(part.name, slot));
	}

	const atom = createAtomInstance(part.part, {
		bond,
		required: !optional,
		// The resolved part owns this object; it is identical for every render of this slot.
		register: part.registration,
		factory: (owner) => {
			const instance = new (part.Ctor as AtomConstructor)(owner);
			return part.role ? instance.role(part.role) : instance;
		}
	});
	return {
		bond,
		atom,
		slot,
		// Direct-seam accessors. A part that renders `<HtmlAtom {...restProps} {part}>` never
		// materializes the `props` packet below, and its rest object stays free of HtmlAtom's named
		// props — so HtmlAtom can forward it by reference with no copy at all. Lazy: only the shape a
		// part actually uses is computed. Passing `part` allocates nothing; these stay getters.
		get preset() {
			return (options.preset?.() ?? atom.preset) as PresetKey | undefined;
		},
		get presetLayer() {
			return bond?.presetLayer(slot);
		},
		// The consuming component already owns the tracked render boundary. Compute this compatibility
		// packet only when requested; direct-part renderers can consume atom/bond without allocating a
		// signal and merged props object that they immediately spread again.
		get props() {
			return mergeAtomProps(
				atom,
				options.preset?.(),
				resolvePartProps(restProps),
				bond?.presetLayer(slot)
			);
		}
	};
}

function resolvePartProps(input: PartPropsInput): PartProps {
	return typeof input === 'function' ? input() : input;
}

/**
 * One house convention for the misuse story, derived from the definition instead of restated at
 * every call site. Thirty-five hand-written copies had already drifted into four different shapes,
 * and each one names a component that nothing checks — a renamed part kept announcing its old self.
 *
 * A family whose display name is not simply the PascalCase of its bond name, or whose root part is
 * not called `Root`, still passes `message` explicitly; that is the exception the option exists for.
 */
function missingRootMessage(name: string, slot: string): string {
	const family = pascalCase(name);
	const article = /^[AEIOU]/.test(family) ? 'an' : 'a';
	return `[ixirjs] <${family}.${pascalCase(slot)} /> must be used within ${article} <${family}.Root />`;
}

function pascalCase(value: string): string {
	let out = '';
	for (const segment of value.split('-')) {
		if (segment) out += segment[0]!.toUpperCase() + segment.slice(1);
	}
	return out;
}
