import type { Component, Snippet } from 'svelte';
import type { HtmlElementTagName } from '$svelte-atoms/core/components/element';
import type { HtmlElementProps, ElementType } from '../element/types';
import type { PresetKey } from '$svelte-atoms/core/context/preset.svelte';
import type { Bond } from '$svelte-atoms/core/shared';
import type { VariantDefinition } from '$svelte-atoms/core/utils';
import type { LifecycleAttachment } from './lifecycle.svelte';
import type { ExplicitBase } from './render-target';

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

// Base interface for snippet context props. Extend to type the snippet argument.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SnippetProps {}

// Variant configuration — static VariantDefinition or dynamic function.
export type Variants =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| VariantDefinition<any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((bond: Bond, variantProps: Record<string, any>) => Record<string, any>);

// Base props for HTML atom components. Extend HtmlAtomProps<'tagname'> to add typed slots/children.
export interface HtmlAtomProps<
	E extends HtmlElementTagName = HtmlElementTagName,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	B extends Base<any> = Base,
	Children extends Snippet<unknown[]> = Snippet
> extends HtmlElementProps<E, Children> {
	bond?: Bond | undefined;

	// Base component or snippet to render.
	base?: B | undefined;

	// Preset key or ordered fallback chain (first registered key wins).
	// Includes `undefined` explicitly: preset is legitimately absent when the atom is optional.
	preset?: PresetKey | undefined;

	// Variant definition (static VariantDefinition or dynamic function receiving bond + props).
	variants?: Variants;

	// Fallback props applied before the preset so user/preset config overrides them.
	// Merge order (last wins): fallback → preset → variants → restProps.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fallback?: Record<string, any> | undefined;

	// SSR-capable init hook. Unlike symbol-keyed lifecycle keys (which Svelte's server
	// rest_props drops), this string-keyed prop survives SSR, so it fires synchronously on the
	// server AND on the client during hydration — keep it idempotent. Returned cleanup runs on
	// client teardown only. Use it when init logic must run during server render.
	oninit?: LifecycleAttachment | undefined;
}

export interface HtmlAtomParams<T extends unknown[] = []> {
	tagName?: HtmlElementTagName | undefined;
	base?: Base<T> | undefined;
	snippet?: Snippet<T> | undefined;
}

export type { ElementType };
