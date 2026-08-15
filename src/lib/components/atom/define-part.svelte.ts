import { untrack } from 'svelte';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset/types';
import type { Atom } from '$ixirjs/ui/shared/bond/atom.svelte';
import type { Bond } from '$ixirjs/ui/shared/bond/bond.svelte';
import { resolveBondPart, type ResolvedBondPart } from '$ixirjs/ui/shared/authoring/metadata';
import { missingRootMessage } from '$ixirjs/ui/shared/authoring/metadata';
import { Kernel } from './kernel/index.svelte';
import type {
	KernelElement,
	KernelElementConfig,
	KernelElementProps,
	KernelElementSeam
} from './kernel/element.svelte';

/**
 * `Kernel.node` + `Kernel.element` for the part that only names itself.
 *
 * Fifty-two rendered parts were the same thirty-four lines with a class string swapped: five
 * imports, a props destructure that pulled out `class`/`preset`/`as`/`children` only to hand all
 * four straight back, and the two calls below. Five facts — definition, slot, tag, base classes,
 * whether the bond is optional — were carrying twenty-nine lines of ceremony each.
 *
 * ```svelte
 * <script lang="ts" generics="E extends HtmlElementTagName = 'h3', B extends Base = Base">
 *   const props: CardTitleProps<E, B> & BasePropsOf<B> = $props();
 *   const el = definePart(CardBond, 'title', () => props, { as: 'h3', class: 'card-title …' });
 * </script>
 *
 * {@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), props.children, { card: el.bond }, el.motion(), el)}
 * ```
 *
 * Props arrive as a thunk for the reason every other seam here takes one: read inside the helper's
 * own tracked boundary, never captured at init.
 *
 * The destructure is what disappears, not the props: `Kernel.element` already splits rich render
 * props from element attributes, so handing it the whole props
 * object produces the same attrs the hand-written `...restProps` did. `as` and `class` are then
 * overwritten with the composed values, exactly as writing them after the spread did.
 *
 * A part with any logic of its own — a `$derived`, a handler, state it stages before the atom —
 * keeps calling `Kernel.node` and `Kernel.element` directly. This covers the ones that have none.
 */
export type DefinePartOptions = {
	/** Default element tag. The consumer's own `as` still wins. */
	as?: string;
	/** The part's base classes. Composed as `[base, '$preset', consumer class]`, as before. */
	class?: string;
	/** Required context is the default. */
	context?: 'required' | 'optional';
	message?: string;
};

/** A part's rich render props plus element attributes. */
export type DefinePartProps = KernelElementProps & {
	class?: unknown;
	as?: unknown;
	preset?: unknown;
};

export type DefinedPart = KernelElement & {
	/** The resolved Bond, for the snippet argument the part passes its children. */
	readonly bond: Bond | undefined;
};

type PartDefinition = {
	get(): Bond | undefined;
	getOrThrow(message?: string): Bond;
};

export function definePart(
	definition: PartDefinition,
	slot: string,
	props: () => DefinePartProps,
	options: DefinePartOptions = {}
): DefinedPart {
	const resolved = resolveBondPart(definition, slot);
	if (resolved.inert) {
		const bond = (definition as { get(): Bond | undefined }).get();
		if (options.context !== 'optional' && !bond) {
			throw new Error(options.message ?? missingRootMessage(resolved.name, slot));
		}
		return defineInertPart(resolved, slot, bond, props, options);
	}

	const plan = Kernel.part(definition as never, slot as never, {
		...(options.as ? { as: options.as } : {}),
		class: options.class ?? ''
	});
	const part = Kernel.node(plan, () => ({ preset: props().preset }), {
		context: options.context ?? 'required',
		...(options.message ? { message: options.message } : {})
	} as never);
	const el = Kernel.element(part, partConfig(props, options));

	return Object.assign(el, { bond: part.bond as Bond | undefined });
}

/** The config both paths hand `Kernel.element`: consumer props with `as`/`class` composed in. */
function partConfig(props: () => DefinePartProps, options: DefinePartOptions): KernelElementConfig {
	const base = options.class;
	return () => {
		const current = props();
		return {
			...current,
			// Written after the spread for the same reason the destructure hoisted them out of
			// `restProps`: these two are computed, not forwarded.
			as: current.as ?? options.as,
			class: base ? [base, '$preset', current.class] : current.class
		};
	};
}

/**
 * The seam an inert part hands `Kernel.element`. One shared prototype avoids a fresh
 * accessor-literal per rendered part; that allocation was
 * a measurable slice of what the fast path exists to remove.
 */
class InertSeam implements KernelElementSeam {
	readonly atom: Atom;
	readonly bond: Bond | undefined;
	readonly #slot: string;

	constructor(atom: Atom, bond: Bond | undefined, slot: string) {
		this.atom = atom;
		this.bond = bond;
		this.#slot = slot;
	}

	// The consumer's own `preset` prop rides the config and wins before this fallback is consulted.
	get preset(): PresetKey | undefined {
		return this.atom.preset as PresetKey;
	}

	get presetLayer(): PresetLike | undefined {
		return this.bond?.presetLayer(this.#slot);
	}
}

/**
 * The inert-part fast path: render a presentation-only slot without registering or activating its
 * Atom.
 *
 * An inert slot (see {@link ResolvedBondPart.inert}) declares neither `atom` nor `role`, so its
 * synthesized Atom contributes exactly `{ id }` to the spread and answers no query and no
 * capability. The Atom itself is constructed — field writes and one id computation, which keeps
 * ids, DEV metadata and the spread byte-identical by construction — but everything around it is
 * skipped: `bond.register` plus its teardown bookkeeping and capability activation.
 * `bench:ssr`'s fingerprint axis is the proof of equivalence.
 *
 * Deliberate contract change, pinned by spec: an inert part is not visible through
 * `bond.nodeByPart(...)`/`values()`/`elements`. A slot that needs querying declares an `atom` or a
 * `role`.
 */
function defineInertPart(
	part: ResolvedBondPart,
	slot: string,
	bond: Bond | undefined,
	props: () => DefinePartProps,
	options: DefinePartOptions
): DefinedPart {
	// Same guard `createAtomInstance` applies: construction reads reactive cells (`bond.id`), and
	// an init-time read must not establish a dependency.
	const atom = untrack(() => new part.Ctor(bond));
	const el = Kernel.element(new InertSeam(atom, bond, slot), partConfig(props, options));
	return Object.assign(el, { bond });
}
