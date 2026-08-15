import type { Component } from 'svelte';
import type { Base, BasePropsOf, RenderProps } from '$ixirjs/ui/components/atom';

/**
 * A `base` component's own props spread flat alongside element attributes and are typed from it.
 *
 * `B` used to infer from the `base` prop and feed nothing, so those props reached the renderer
 * through the rest-props channel — which `ElementProps`' index signature accepts unconditionally,
 * giving neither autocomplete nor errors. `BasePropsOf<B>` is intersected into each part's
 * `$props()` annotation, which is the only position that works for both prop shapes: the
 * interface-shaped families cannot `extend` a conditional type (`TS2312`).
 */
declare const Renderer: Component<{ class?: string; tone: 'warn' | 'info'; rounded?: boolean }>;
declare const Plain: Component<{ class?: string }>;

declare function part<B extends Base>(props: RenderProps<'div', B> & BasePropsOf<B>): void;

// Infers B from `base`, then types the sibling props against it.
part({ base: Renderer, tone: 'info', rounded: true });

// @ts-expect-error tone must be 'warn' | 'info'
part({ base: Renderer, tone: 'nope' });

// A base with no props of its own adds nothing.
part({ base: Plain });

// ── The three guards in BasePropsOf, each load-bearing ──

type Assert<T extends true> = T;
type Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

// 1. No concrete base named: adds nothing. Without the `[Base] extends [B]` guard the conditional
//    distributes over `Base`'s union and the result drops `HtmlElementProps`' index signature,
//    turning ordinary props into excess-property errors (measured: 1330 of them).
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type _wideDefaultAddsNothing = Assert<Eq<BasePropsOf<Base>, {}>>;
export type _ordinaryPropsSurvive = Assert<
	'children' extends keyof (RenderProps<'div', Base> & BasePropsOf<Base>) ? true : false
>;

// 2. The static families spell `never` to forbid `base`; they take no base props either.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type _neverOptOut = Assert<Eq<BasePropsOf<never>, {}>>;

// 3. Props are optional-with-`undefined`, not required and not `Partial`. Required props would
//    break every wrapper that forwards `...restProps` into another atom component while `B` is
//    still generic; `Partial` yields `prop?: T`, which `exactOptionalPropertyTypes` rejects.
export type _optionalNotRequired = Assert<
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	{} extends BasePropsOf<typeof Renderer> ? true : false
>;
export const acceptsExplicitUndefined: BasePropsOf<typeof Renderer> = { tone: undefined };
