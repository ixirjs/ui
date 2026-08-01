<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base, C extends AnySnippet = Snippet">
	import { type Component, type Snippet } from 'svelte';
	import type { AnySnippet, Base, HtmlAtomProps } from './types';
	import { RootBond } from '../root';
	import { HtmlElement } from '../element';
	import { getPreset } from '$svelte-atoms/core/context';
	import type { PresetModuleName } from '$svelte-atoms/core/context/preset.svelte';
	import SnippetRenderer from './snippet-renderer.svelte';
	import * as resolvers from './resolvers';
	import { runLifecycle } from './lifecycle.svelte';

	const rootBond = RootBond.get();

	let {
		class: klass = '',
		as = undefined,
		base = undefined,
		preset: presetKey = undefined,
		bond = undefined,
		variants = undefined,
		fallback = undefined,
		children: children = undefined,
		...restProps
	}: HtmlAtomProps<E, B, C> = $props();

	// Bond lifecycle attachments (createLifecycleKey): fire each phase's `(bond) => …` callbacks
	// against the live bond and hand back the props with those symbol keys stripped, so they
	// never reach the DOM (where a symbol-fn prop would be mistaken for a node attachment).
	const lifecycle = runLifecycle(
		() => restProps,
		() => bond
	);

	// Each stage call goes through the orchestrator; reactivity granularity is
	// preserved because each $derived reads only the props its stage needs.
	const preset = $derived.by(() =>
		resolvers.resolvePreset(presetKey as PresetModuleName | PresetModuleName[], bond, getPreset)
	);
	const localVariants = $derived(resolvers.resolveLocalVariants(variants, bond, lifecycle.rest));
	const mergedVariants = $derived.by(() =>
		resolvers.resolveVariants(preset, localVariants, bond, lifecycle.rest)
	);
	// The merge kernel: ONE walk over fallback → preset → variants → rest
	// (ADR 0004 Decision 5). Class string and spread attrs both come from it.
	const folded = $derived.by(() =>
		resolvers.foldLayers(preset, mergedVariants, lifecycle.rest, fallback)
	);
	const finalKlass = $derived(resolvers.resolveClass(klass, folded));
	const finalBase = $derived(resolvers.resolveBase(base, preset));
	const finalAs = $derived(resolvers.resolveAs(as, preset));
	const finalRestProps = $derived(folded.attrs);

	const atom = $derived(rootBond?.state?.props?.renderers?.html ?? HtmlElement);

	const baseIsSnippet = $derived(resolvers.isSnippetBase(finalBase));

	// Track the renderer component and its props as INDEPENDENT signals.
	// Component identity only flips when base/atom change; prop changes
	// don't drag the component identity with them.
	const RendererComponent = $derived(
		baseIsSnippet ? (SnippetRenderer as unknown as Component) : ((finalBase ?? atom) as Component)
	);

	const rendererProps = $derived.by((): Record<string, unknown> => {
		if (baseIsSnippet) {
			return {
				snippet: finalBase,
				class: finalKlass,
				as: finalAs,
				children: children,
				...finalRestProps
			};
		}
		return { class: finalKlass, as: finalAs, ...finalRestProps };
	});

	function forwardChildren(...args: any[]) {
		return (children as ((...args: unknown[]) => unknown) | undefined)?.(...args);
	}
</script>

<RendererComponent {...rendererProps} children={forwardChildren} />
