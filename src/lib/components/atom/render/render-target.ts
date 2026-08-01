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

export function snippetBase(snippet: SnippetBaseValue): ExplicitSnippetBase {
	return { kind: 'snippet', snippet };
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

export function resolveRendererProps<E extends Element = Element>(
	target: RenderTarget,
	klass: unknown,
	as: unknown,
	attrs: RendererProps,
	motion: ResolvedMotion<E> | undefined = undefined,
	options: { presentationResolved?: boolean } = {}
): RendererProps {
	const props = {
		class: klass,
		as,
		...(options.presentationResolved ? { __resolvedPresentation: true } : {}),
		...attrs,
		...(motion && Object.keys(motion).length > 0 ? { motion } : {})
	};
	if (target.kind === 'snippet') return { snippet: target.snippet, ...props };
	return props;
}
