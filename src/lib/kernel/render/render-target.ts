import type { Component, Snippet } from 'svelte';
import type { ResolvedMotion } from '$ixirjs/ui/preset';

export type ComponentBaseValue = Component;
export type SnippetBaseValue = Snippet;

export type ExplicitComponentBase = {
	readonly kind: 'component';
	readonly component: ComponentBaseValue;
};

export type ExplicitSnippetBase = {
	readonly kind: 'snippet';
	readonly snippet: SnippetBaseValue;
};

export type ExplicitBase = ExplicitComponentBase | ExplicitSnippetBase;

export type RenderTarget =
	| { readonly kind: 'component'; readonly component: ComponentBaseValue }
	| { readonly kind: 'snippet'; readonly snippet: SnippetBaseValue };

export type RendererProps = Record<string | symbol, unknown>;

// Explicit wrappers avoid relying on function shape when a base is ambiguous.
export function componentBase(component: ComponentBaseValue): ExplicitComponentBase {
	return { kind: 'component', component };
}

function isExplicitBase(base: unknown): base is ExplicitBase {
	if (!base || typeof base !== 'object') return false;
	const value = base as Partial<ExplicitBase>;
	return (
		(value.kind === 'component' && 'component' in value) ||
		(value.kind === 'snippet' && 'snippet' in value)
	);
}

// Compatibility path: historical snippets are arrow functions without a prototype.
export function isSnippetBase(base: unknown): base is SnippetBaseValue {
	return typeof base === 'function' && !base.prototype;
}

export function resolveRenderTarget(
	base: unknown,
	fallbackRenderer: ComponentBaseValue
): RenderTarget {
	if (isExplicitBase(base)) {
		return base.kind === 'snippet'
			? { kind: 'snippet', snippet: base.snippet }
			: { kind: 'component', component: base.component };
	}

	if (isSnippetBase(base)) return { kind: 'snippet', snippet: base };

	return {
		kind: 'component',
		component: (base ?? fallbackRenderer) as ComponentBaseValue
	};
}

export function resolveRendererComponent(
	target: RenderTarget,
	snippetAdapter: ComponentBaseValue
): ComponentBaseValue {
	return target.kind === 'snippet' ? snippetAdapter : target.component;
}

/** Emptiness by early exit: `Object.keys(motion).length` allocates an array to answer yes/no. */
function hasMotion(motion: object): boolean {
	for (const _ in motion) return true;
	return false;
}

export function resolveRendererProps<E extends Element = Element>(
	target: RenderTarget,
	klass: unknown,
	as: unknown,
	attrs: RendererProps,
	motion: ResolvedMotion<E> | undefined = undefined,
	options: { presentationResolved?: boolean } = {}
): RendererProps {
	// Built by assignment rather than by nested spreads. The literal form allocated up to four
	// objects and a key array per call — two of them the `? {…} : {}` conditionals, whose false arm
	// is a fresh empty object every time — to produce one. Key order is unchanged: `snippet`, then
	// `class`/`as`, then the resolved flag, then attrs, then motion, exactly as the spreads wrote it.
	const props: RendererProps = target.kind === 'snippet' ? { snippet: target.snippet } : {};
	props.class = klass;
	props.as = as;
	if (options.presentationResolved) props.__presentationResolved = true;
	Object.assign(props, attrs);
	if (motion && hasMotion(motion)) props.motion = motion;
	return props;
}
