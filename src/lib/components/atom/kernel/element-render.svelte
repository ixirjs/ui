<script module lang="ts">
	import type { Snippet } from 'svelte';
	import HtmlElement from '$ixirjs/ui/components/element/html-element.svelte';
	import { componentBase, resolveRendererProps } from '../render/render-target';
	import {
		divBranch,
		dynamicBranch,
		divLocal,
		dynamicLocal,
		divGlobal,
		dynamicGlobal
	} from '../render/element-branches.svelte';
	import type { KernelElement } from './element.svelte';
	import RendererAdapter from './renderer.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Body = Snippet<[any]> | Snippet<[]>;
	const HTML_ELEMENT_TARGET = componentBase(HtmlElement as never);
	export const FORWARD_BODY_ARG = Symbol('@ixirjs/kernel:forwardBodyArg');

	export { elementBranch, componentBranch, renderKernelElement };
</script>

{#snippet renderKernelElement(el: KernelElement, body?: Body, bodyArg?: unknown)}
	{@const mode = el.mode()}
	{@render (mode === 'div'
		? divBranch
		: mode === 'dynamic'
			? dynamicBranch
			: mode === 'divLocal'
				? divLocal
				: mode === 'dynamicLocal'
					? dynamicLocal
					: mode === 'divGlobal'
						? divGlobal
						: mode === 'dynamicGlobal'
							? dynamicGlobal
							: mode === 'element'
								? elementBranch
								: componentBranch)(
		el.tag(),
		el.class(),
		el.attrs(),
		body,
		bodyArg,
		el.motion(),
		el
	)}
{/snippet}

{#snippet elementBranch(
	tag: string,
	klass: string,
	attrs: Record<string | symbol, unknown>,
	body?: Body,
	bodyArg?: unknown,
	_motion?: unknown,
	el?: KernelElement
)}
	<HtmlElement
		{...resolveRendererProps(
			HTML_ELEMENT_TARGET,
			klass,
			tag,
			attrs,
			el!.resolvedMotion() as never,
			{ presentationResolved: true }
		)}
	>
		{@render body?.(bodyArg)}
	</HtmlElement>
{/snippet}

{#snippet componentBranch(
	_tag: string,
	_class: string,
	_attrs: Record<string | symbol, unknown>,
	body?: Body,
	bodyArg?: unknown,
	_motion?: unknown,
	el?: KernelElement
)}
	{@const renderer = el!.renderer()}
	<RendererAdapter
		component={renderer.component}
		props={renderer.props}
		{...body ? { children: body } : {}}
		{...bodyArg !== undefined ? { bodyArg } : {}}
		forwardBodyArg={bodyArg === FORWARD_BODY_ARG}
	/>
{/snippet}
