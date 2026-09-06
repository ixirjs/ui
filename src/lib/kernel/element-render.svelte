<script module lang="ts">
	import type { Snippet } from 'svelte';
	import HtmlElement from '$ixirjs/ui/components/element/html-element.svelte';
	import { componentBase, resolveRendererProps } from './render/render-target';
	import {
		divPlain,
		headingPlain,
		divBranch,
		headingBranch,
		buttonBranch,
		dynamicBranch,
		divLocal,
		dynamicLocal,
		divGlobal,
		dynamicGlobal,
		type ElementBody,
		type ElementBranch
	} from './render/element-branches.svelte';
	import type { RenderMode } from './render/render-mode';
	import type { KernelElement } from './element.svelte';
	import RendererAdapter from './renderer.svelte';

	const HTML_ELEMENT_TARGET = componentBase(HtmlElement as never);
	export const FORWARD_BODY_ARG = Symbol('@ixirjs/kernel:forwardBodyArg');

	/**
	 * Mode → leaf, owned once.
	 *
	 * This mapping used to exist twice: as a lookup table in `kernel/index.svelte.ts` and as a
	 * ternary chain here. Two spellings of one seven-way fact, and they had already drifted — the
	 * table shipped under a misspelled name. Both callers now read this.
	 *
	 * Declared after the branch snippets it names? No: snippet declarations are hoisted to module
	 * scope by the compiler, but the table is built at module evaluation, so it is written here and
	 * populated lazily on first dispatch, which is also the first moment either caller can need it.
	 */
	let branchByMode: Record<string, ElementBranch> | undefined;

	export function branchForMode(mode: RenderMode): ElementBranch {
		branchByMode ??= {
			div: divBranch,
			divPlain,
			heading: headingBranch,
			headingPlain,
			button: buttonBranch,
			dynamic: dynamicBranch,
			divLocal,
			dynamicLocal,
			divGlobal,
			dynamicGlobal,
			element: elementBranch as ElementBranch
		};
		return branchByMode[mode] ?? (componentBranch as ElementBranch);
	}

	// Keep optional caller arguments without emitting optional snippet parameter syntax.
	type KernelBranch = Snippet<[el: KernelElement, body?: ElementBody, arg?: unknown]>;
	export const elementBranch: KernelBranch = elementBranchLeaf;
	export const componentBranch: KernelBranch = componentBranchLeaf;
</script>

{#snippet elementBranchLeaf(el: KernelElement, body: ElementBody | undefined, arg: unknown)}
	<HtmlElement
		{...resolveRendererProps(
			HTML_ELEMENT_TARGET,
			el.class(),
			el.tag(),
			el.attributes(),
			el.resolvedMotion() as never,
			{ presentationResolved: true }
		)}
	>
		{@render body?.(arg)}
	</HtmlElement>
{/snippet}

{#snippet componentBranchLeaf(el: KernelElement, body: ElementBody | undefined, arg: unknown)}
	{@const renderer = el.renderer()}
	<RendererAdapter
		component={renderer.component}
		props={renderer.props}
		{...body ? { children: body } : {}}
		{...arg !== undefined ? { bodyArg: arg } : {}}
		forwardBodyArg={arg === FORWARD_BODY_ARG}
	/>
{/snippet}
