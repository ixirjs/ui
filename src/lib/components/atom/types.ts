import type { Component, Snippet } from 'svelte';
import type { HtmlElementTagName } from '$ixirjs/ui/components/element';
import type { HtmlElementProps, ElementType } from '$ixirjs/ui/components/element/types';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset';
import type { Bond } from '$ixirjs/ui/shared';
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

// Re-exported because every part's props interface and every component's `generics` attribute
// constrains its element generic on it. 237 of them wrote the raw `keyof HTMLElementTagNameMap`
// instead — the same type, 27 characters wide, which pushed a one-line props interface over
// printWidth and made prettier wrap it into four. The alias has existed in `components/element` all
// along; it just was not reachable from the barrel every part already imports `Base` from.
export type { ElementType, HtmlElementTagName };
