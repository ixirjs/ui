import type { HTMLAttributes, SVGAttributes } from 'svelte/elements';
import type { TransitionConfig } from 'svelte/transition';
import type { ClassValue } from '$svelte-atoms/core/utils';
import type { Snippet } from 'svelte';

// Element tag names

export type HtmlElementTagName = keyof HTMLElementTagNameMap;
export type SvgElementTagName = keyof SVGElementTagNameMap;
export type ElementTagName = HtmlElementTagName | SvgElementTagName;

export type HtmlElementType<T extends HtmlElementTagName> = HTMLElementTagNameMap[T];
export type SvgElementType<T extends SvgElementTagName> = SVGElementTagNameMap[T];

export type ElementType<T> = T extends HtmlElementTagName
	? HTMLElementTagNameMap[T]
	: T extends SvgElementTagName
		? SVGElementTagNameMap[T]
		: never;

// Attributes

export type ElementAttributes<T extends ElementTagName> = T extends HtmlElementTagName
	? HTMLAttributes<ElementType<T>>
	: T extends SvgElementTagName
		? SVGAttributes<ElementType<T>>
		: never;

// Transition & lifecycle functions

export interface TransitionFunction<T extends Element = Element> {
	(node: T): Partial<TransitionConfig> | void;
}

export interface NodeFunction<T extends ElementTagName = ElementTagName> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(node: ElementType<T>, ...args: any[]): any;
}

// Base element props

export interface ElementProps<T extends ElementTagName = ElementTagName> extends Record<
	string,
	unknown
> {
	class?: ClassValue | ClassValue[];

	// polymorphic tag override
	as?: T | (string & {});

	// emit styles as :global rather than scoped
	global?: boolean;

	// `| undefined` on the lifecycle/transition hooks is required by exactOptionalPropertyTypes:
	// callers forward these from optional props (value possibly `undefined`), e.g. `<Atom {initial}>`.
	// runs once on mount, before enter transition
	initial?: NodeFunction<T> | undefined;

	enter?: TransitionFunction<ElementType<T>> | undefined;

	exit?: TransitionFunction<ElementType<T>> | undefined;

	animate?: NodeFunction<T> | undefined;

	onmount?: NodeFunction<T> | undefined;

	// `| undefined`: see onmount
	ondestroy?: NodeFunction<T> | undefined;

	[key: string]: unknown;
}

// HTML element props (with transition events)

export interface HtmlElementEventProps {
	onintroend?: (ev: TransitionEvent) => void;
	onexitend?: (ev: TransitionEvent) => void;
}

// Svelte's HTMLAttributes re-declares the transition-lifecycle events (e.g.
// `onintroend`) as CustomEvent handlers, which collide with the library's
// CSS-`TransitionEvent`-flavored HtmlElementEventProps when the two are
// intersected on a component's props. Strip the overlapping keys so the
// library's definitions win when a component does `Props & HtmlAttributes<E>`.
export type HtmlElementAttributes<E extends EventTarget> = Omit<
	HTMLAttributes<E>,
	keyof HtmlElementEventProps
>;

export interface HtmlElementProps<
	T extends HtmlElementTagName = 'div',
	Children extends Snippet<unknown[]> = Snippet
>
	extends ElementProps<T>, HtmlElementEventProps {
	children?: Children;
}

// SVG element props — mirrors HtmlElementProps so `children` and the transition events
// (onintroend/onexitend) are declared explicitly rather than collapsing to `{}` via the
// HTMLAttributes Omit (ElementProps's index signature otherwise strips them).
export interface SvgElementProps<
	T extends SvgElementTagName = 'g',
	Children extends Snippet<unknown[]> = Snippet
>
	extends ElementProps<T>, HtmlElementEventProps {
	children?: Children;
}
