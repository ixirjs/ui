import type { Bond } from '$ixirjs/ui/shared/bond/bond.svelte';
import { Kernel } from './kernel/index.svelte';
import type { KernelNode } from './kernel/index.svelte';
import type { KernelElement, KernelElementProps } from './kernel/element.svelte';

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
 * {@render Kernel.render(el)(el, props.children, { card: el.bond })}
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

/**
 * What `definePart` hands back: a renderable handle plus its Bond.
 *
 * A union, not `KernelElement`, because the two are genuinely different values — a synthesized-Atom
 * slot gets the node itself, a declared-Atom slot gets a resolved element. Both satisfy
 * `Kernel.render`, and `bond` is what the call site actually reads. Writing this as `KernelElement`
 * and casting would typecheck every caller against members half of them do not have at runtime.
 */
export type DefinedPart = (KernelElement | KernelNode) & {
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
	const plan = Kernel.plan(definition as never, slot as never, {
		...(options.as ? { as: options.as } : {}),
		class: options.class ?? ''
	});

	// The node takes the whole props thunk on both lanes, so `KernelNode.elementConfig` is the only
	// description of this element that exists. It used to take `() => ({ preset })` here and hand the
	// real props to a second, near-identical config builder further down — two spellings of one
	// element, differing only in a dead `base ? … : …` branch no caller could reach (all 33 pass a
	// `class`). The node's own `preset`/`presetLayer` getters read the same values either way, because
	// `Kernel.element` resolves both from the config first and the seam second.
	// `eagerElement` only asks the lane question, and only a synthesized slot has one to ask. A
	// declared-Atom slot builds its element unconditionally below, so asking there resolved a class
	// through `klass()` — a preset context read and possibly a whole `twMerge` — that nothing reads.
	// Both branches converge on the same `useKernelElement(part, part.elementConfig)` call.
	const part = Kernel.node(plan, props, {
		context: options.context ?? 'required',
		eagerElement: plan.synthesized,
		...(options.message ? { message: options.message } : {})
	} as never);

	// The node IS the handle when the slot's Atom adds nothing but `id`.
	//
	// Every `definePart` slot used to be wrapped in `Kernel.element`, which resolves the full
	// presentation for that part on every render — measured at ~6.3 µs per part against the node's
	// own class-only lane on the same fixture (`bench:lanes`). For a slot whose Atom is synthesized
	// that work had nothing to fold in: the class lane composes the same class, the same attrs and
	// the same id, and the node escalates the moment the consumer passes something rich.
	//
	// A slot with a DECLARED Atom keeps full resolution, and must: its Atom contributes attrs,
	// handlers and cross-slot ARIA to the spread, and the class lane cannot fold those in without
	// materializing the Atom — which is the one thing the lazy-node design exists to avoid. The
	// `bench:ssr` fingerprints caught exactly this: taking the fast lane for Collapsible's and
	// DataGrid's declared-Atom parts dropped 91 and 5 bytes per unit of real attributes.
	if (plan.synthesized) return part as DefinedPart;

	// A declared-Atom part always needs the element; reuse the one the node resolved for itself when
	// its props were already rich, rather than building a second with the same config.
	const el = part.element ?? Kernel.element(part, part.elementConfig);
	return Object.assign(el, { bond: part.bond as Bond | undefined });
}
