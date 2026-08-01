import type { Component, Snippet } from 'svelte';
import type { HtmlElementTagName } from '$svelte-atoms/core/components/element';
import type { HtmlElementProps, ElementType } from '../element/types';
import type { PresetKey } from '$svelte-atoms/core/context/preset.svelte';
import type { Bond } from '$svelte-atoms/core/shared';
import type { VariantDefinition } from '$svelte-atoms/core/utils';

// ============================================================================
// Base Component/Snippet Types (Extensible)
// ============================================================================

// Base type for component-based implementations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentBase = Component<any, any, any>;

// Base type for snippet-based implementations
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
	? ComponentBase // Treat as component if args is an object
	: Args extends []
		? SnippetBase | ComponentBase // Empty args or void
		: Args extends unknown[]
			? SnippetBase // Array of args
			: never;

// ============================================================================
// Snippet Props (Base for extensible snippet contexts)
// ============================================================================

// Base interface for snippet context props. Extend to type the snippet argument.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SnippetProps {}

// ============================================================================
// Variants (Support both static and dynamic)
// ============================================================================

// Variant configuration - can be static or dynamic
export type Variants =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| VariantDefinition<any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((bond: Bond, variantProps: Record<string, any>) => Record<string, any>);

// ============================================================================
// Atom Props (Core, Extensible)
// ============================================================================

// Base props for HTML atom components. Extend HtmlAtomProps<'tagname'> to add typed slots/children.
export interface HtmlAtomProps<
	E extends HtmlElementTagName = HtmlElementTagName,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	B extends Base<any> = Base,
	Children extends Snippet<unknown[]> = Snippet
> extends HtmlElementProps<E, Children> {
	// Optional Bond for state management & context
	bond?: Bond | undefined;

	// Base component or snippet to render (can be overridden)
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
}

export type { ElementType };
