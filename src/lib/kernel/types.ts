import type { Component, Snippet } from 'svelte';
import type { HtmlElementTagName } from '$ixirjs/ui/components/element';
import type { HtmlElementProps, ElementType } from '$ixirjs/ui/components/element/types';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset';

type Bond = BondLike;
import type { VariantDefinition } from '$ixirjs/ui/utils';
import type { LifecycleAttachment } from './render/lifecycle.svelte';
import type { ExplicitBase } from './render/render-target';

// Base component/snippet types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentBase = Component<any, any, any>;

export type SnippetBase = Snippet;

// Permissive snippet type used as a generic constraint where the snippet's arguments
// are not known ahead of time. Inference narrows it to the actual snippet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySnippet = Snippet<any[]>;

// Generic base — component when args is an object, snippet for array or empty args.
export type Base<Args extends unknown[] = []> = Args extends [
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Record<string, any>,
	...unknown[]
]
	? ComponentBase | ExplicitBase
	: Args extends []
		? SnippetBase | ComponentBase | ExplicitBase
		: Args extends unknown[]
			? SnippetBase | ExplicitBase
			: never;

/**
 * The props a `base` component declares, minus the four values Kernel always supplies.
 *
 * `B` inferred from the `base` prop and was consumed by nothing, so a base's own props reached the
 * renderer through the rest-props channel — which `ElementProps`' index signature accepts
 * unconditionally, giving neither autocomplete nor errors. Naming them is what makes them visible.
 *
 * Every prop is made optional-with-`undefined` rather than kept as declared. Two reasons, both
 * load-bearing:
 *
 * - A component that *forwards* `...restProps` into another rendered component cannot discharge the
 *   inner component's required base props while `B` is still generic. Requiring them turns every
 *   forwarding wrapper into a type error.
 * - `Partial<T>` is not the same type: under `exactOptionalPropertyTypes` it yields `prop?: T`,
 *   which rejects an explicitly-passed `undefined`. The mapping below keeps `| undefined`.
 *
 * The trade is that a base's required prop is not enforced at the call site. Autocomplete and
 * wrong-value rejection — the things actually asked for — both survive.
 */
type OptionalUndefined<T> = { [K in keyof T]?: T[K] | undefined };

export type BasePropsOf<B> = [B] extends [never]
	? // The static families spell `never` to forbid `base`; they take no base props either.
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		{}
	: [Base] extends [B]
		? // `B` is still the wide default — no concrete base named, so add nothing. Without this the
			// conditional distributes over `Base`'s union and the resulting union of intersections drops
			// `HtmlElementProps`' index signature, turning every ordinary prop into an excess-property
			// error (measured: 1330 of them).
			// eslint-disable-next-line @typescript-eslint/no-empty-object-type
			{}
		: // Non-distributive on purpose, for the same reason.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			[B] extends [Component<infer P, any, any>]
			? OptionalUndefined<Omit<P, 'class' | 'as' | 'snippet' | 'motion'>>
			: // eslint-disable-next-line @typescript-eslint/no-empty-object-type
				{};

// Base interface for snippet context props. Extend to type the snippet argument.
export interface SnippetProps {}

// Variant configuration — static VariantDefinition or dynamic function.
export type Variants =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| VariantDefinition<any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((bond: Bond, variantProps: Record<string, any>) => Record<string, any>);

// Shared rich render props. Extend RenderProps<'tagname'> to add typed slots/children.
export interface RenderProps<
	E extends HtmlElementTagName = HtmlElementTagName,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	B extends Base<any> = Base,
	Children extends Snippet<unknown[]> = Snippet
> extends HtmlElementProps<E, Children> {
	/** Bond instance this part participates in, for shared state and cross-slot coordination. */
	bond?: Bond | undefined;

	/** Base component or snippet to render instead of the default element. */
	base?: B | undefined;

	/**
	 * Preset key or ordered fallback chain (first registered key wins).
	 * Includes `undefined` explicitly: preset is legitimately absent on optional parts.
	 */
	preset?: PresetKey | undefined;

	/**
	 * A per-instance presentation layer for compound parts. Its `class`, `attrs`, and `motion`
	 * fields apply after variants and before consumer attributes; structural `render` fields and
	 * variant definitions remain owned by the primary preset. Factories receive the same `{ bond }`
	 * context as registered presets.
	 */
	presetLayer?: PresetLike | undefined;

	/** Variant definition — a static `VariantDefinition`, or a function receiving bond and props. */
	variants?: Variants;

	/**
	 * SSR-capable init hook. Unlike symbol-keyed lifecycle keys (which Svelte's server
	 * rest_props drops), this string-keyed prop survives SSR, so it fires synchronously on the
	 * server AND on the client during hydration — keep it idempotent. Returned cleanup runs on
	 * client teardown only. Use it when init logic must run during server render.
	 */
	oninit?: LifecycleAttachment | undefined;
}

/**
 * The spread a part that IS its element hands its literal tag: `<div {...node.leafAttrs()}>`.
 *
 * `any`-valued for the reason `MotionAttrs` in `element-branches.svelte` is: an element spread
 * carrying attachment symbols must type every symbol-keyed value as an attachment, and this one
 * carries both attachments and ordinary attributes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LeafAttrs = Record<string, any>;

/**
 * Props of a part that IS its element.
 *
 * A part written as a literal `<div {...node.spread()}>` pays no dispatch: no `{@render}` block, no
 * branch, no `BranchManager`, no hydration anchor to choose a leaf — one block, one branch and one
 * comment fewer per part, −13…15% on a card's mount (`perf-vs-shadcn-2026-08.md` §16). What it gives
 * up is everything the dispatch existed to honour: a polymorphic tag, a renderer, motion and the
 * renderer lifecycle attributes. Those are typed `never` here so a consumer learns at the call site
 * rather than from a silently plain `<div>`. Ordinary element attributes, `class`, `preset` and
 * `presetLayer` still apply.
 */
export interface PlainPartProps<
	E extends HtmlElementTagName = 'div',
	Children extends Snippet<unknown[]> = Snippet
> extends RenderProps<E, never, Children> {
	as?: never;
	base?: never;
	motion?: never;
	initial?: never;
	enter?: never;
	exit?: never;
	animate?: never;
	onmount?: never;
	ondestroy?: never;
	onintroend?: never;
	onexitend?: never;
	global?: never;
	oninit?: never;
}

// Re-exported because every part's props interface and every component's `generics` attribute
// constrains its element generic on it. 237 of them wrote the raw `keyof HTMLElementTagNameMap`
// instead — the same type, 27 characters wide, which pushed a one-line props interface over
// printWidth and made prettier wrap it into four. The alias has existed in `components/element` all
// along; it just was not reachable from the barrel every part already imports `Base` from.
export type { ElementType, HtmlElementTagName };

/**
 * Root-owned, per-slot presentation layers a family shares with its parts (`presets.header`,
 * `presets.item`, …). Lived in `bond/types.ts` until the Bond runtime was deleted; it is a
 * presentation fact, not a runtime one, so it belongs beside the other part prop types.
 */
export type BondPresetLayers = Readonly<Record<string, PresetLike | undefined>>;

/** The two props every family's shared object takes: its identity seed and its preset layers. */
export type BondStateProps = {
	id?: string;
	presets?: BondPresetLayers | undefined;
};

/**
 * A non-DOM element an attachment may be handed (the popover's virtual anchor). Lived in
 * `bond/types.ts` until the Bond runtime was deleted.
 */
export type BondVirtualElement = { getBoundingClientRect(): DOMRect; contextElement?: Element };

/**
 * The family state object a part hands the seam as `state`, and that a preset factory receives as
 * `{ bond }`. Unconstrained on purpose: it is a plain class now, not a runtime type.
 */
export type BondLike = object;
