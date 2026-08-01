import type { Component, Snippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import {
	componentBase,
	resolveRenderTarget,
	resolveRendererComponent,
	resolveRendererProps,
	snippetBase
} from './render-target';

function FallbackRenderer() {}
function NamedComponent() {}

const fallbackRenderer = FallbackRenderer as unknown as Component;
const namedComponent = NamedComponent as unknown as Component;

describe('render target normalization', () => {
	it('uses the fallback renderer when no base is provided', () => {
		const target = resolveRenderTarget(undefined, fallbackRenderer);

		expect(target).toEqual({ kind: 'component', component: fallbackRenderer });
	});

	it('treats named function bases as component bases for compatibility', () => {
		const target = resolveRenderTarget(namedComponent, fallbackRenderer);

		expect(target).toEqual({ kind: 'component', component: namedComponent });
	});

	it('keeps the legacy arrow-function snippet heuristic', () => {
		const snippet = (() => undefined) as unknown as Snippet;
		const target = resolveRenderTarget(snippet, fallbackRenderer);

		expect(target).toEqual({ kind: 'snippet', snippet });
	});

	it('lets callers mark an arrow function as a component base explicitly', () => {
		const arrowComponent = (() => undefined) as unknown as Component;
		const target = resolveRenderTarget(componentBase(arrowComponent), fallbackRenderer);

		expect(target).toEqual({ kind: 'component', component: arrowComponent });
	});

	it('lets callers mark a function as a snippet base explicitly', () => {
		function namedSnippet() {}
		const snippet = namedSnippet as unknown as Snippet;
		const target = resolveRenderTarget(snippetBase(snippet), fallbackRenderer);

		expect(target).toEqual({ kind: 'snippet', snippet });
	});
});

describe('renderer adapter contract', () => {
	it('renders component targets with their own component', () => {
		const snippetAdapter = (() => undefined) as unknown as Component;
		const target = { kind: 'component', component: namedComponent } as const;

		expect(resolveRendererComponent(target, snippetAdapter)).toBe(namedComponent);
	});

	it('renders snippet targets through the snippet adapter', () => {
		const snippetAdapter = (() => undefined) as unknown as Component;
		const snippet = (() => undefined) as unknown as Snippet;
		const target = { kind: 'snippet', snippet } as const;

		expect(resolveRendererComponent(target, snippetAdapter)).toBe(snippetAdapter);
	});

	it('builds component renderer props from class, as, and folded attrs', () => {
		const attachment = Symbol('attachment');
		const target = { kind: 'component', component: namedComponent } as const;
		const props = resolveRendererProps(target, 'rounded', 'button', {
			[attachment]: 'kept',
			'data-tone': 'neutral'
		});

		expect(props).not.toHaveProperty('snippet');
		expect(props.class).toBe('rounded');
		expect(props.as).toBe('button');
		expect(props['data-tone']).toBe('neutral');
		expect(props[attachment]).toBe('kept');
	});

	it('adds the snippet only for snippet renderer props', () => {
		const snippet = (() => undefined) as unknown as Snippet;
		const target = { kind: 'snippet', snippet } as const;
		const props = resolveRendererProps(target, 'rounded', 'button', {
			'data-tone': 'neutral'
		});

		expect(props.snippet).toBe(snippet);
		expect(props.class).toBe('rounded');
		expect(props.as).toBe('button');
		expect(props['data-tone']).toBe('neutral');
	});
});
