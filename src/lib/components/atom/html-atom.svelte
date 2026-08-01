<script
	lang="ts"
	generics="Tag extends keyof HTMLElementTagNameMap = 'div', BaseComponent extends Base = Base, Children extends AnySnippet = Snippet"
>
	import { type Snippet } from 'svelte';
	import type { AnySnippet, Base, HtmlAtomProps } from './types';
	import { RootBond } from '../root';
	import { HtmlElement } from '../element';
	import { getPreset } from '$svelte-atoms/core/context';
	import type { PresetModuleName } from '$svelte-atoms/core/context/preset.svelte';
	import SnippetAdapter from './snippet.svelte';
	import * as resolvers from './resolvers';
	import {
		resolveRendererComponent,
		resolveRendererProps,
		resolveRenderTarget
	} from './render-target';
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
		oninit = undefined,
		children: children = undefined,
		...restProps
	}: HtmlAtomProps<Tag, BaseComponent, Children> = $props();

	// Bond lifecycle attachments (createLifecycleKey): fire each phase's `(bond) => …` callbacks
	// against the live bond. The lifecycle keys are symbol-keyed, so Svelte ignores them on the
	// DOM spread downstream — `restProps` flows on untouched.
	runLifecycle(
		() => restProps,
		() => bond,
		() => oninit
	);

	// One $derived per cascade stage so each tracks only the props its stage reads.
	const preset = $derived.by(() =>
		resolvers.resolvePreset(presetKey as PresetModuleName | PresetModuleName[], bond, getPreset)
	);
	const localVariants = $derived(resolvers.resolveLocalVariants(variants, bond, restProps));
	const mergedVariants = $derived.by(() =>
		resolvers.resolveVariants(preset, localVariants, bond, restProps)
	);
	// The merge kernel: ONE walk over fallback → preset → variants → rest.
	// Class string and spread attrs both come from it.
	const folded = $derived.by(() =>
		resolvers.foldLayers(preset, mergedVariants, restProps, fallback)
	);
	const finalKlass = $derived(resolvers.resolveClass(klass, folded));
	const finalBase = $derived(resolvers.resolveBase(base, preset));
	const finalAs = $derived(resolvers.resolveAs(as, preset));
	const finalRestProps = $derived(folded.attrs);

	const atom = $derived(rootBond?.state?.props?.renderers?.html ?? HtmlElement);

	// Render-target normalization names the component/snippet decision in one place.
	const renderTarget = $derived(resolveRenderTarget(finalBase, atom));
	// Component identity and props are separate signals so prop changes do not remount the renderer.
	const RendererComponent = $derived(resolveRendererComponent(renderTarget, SnippetAdapter));
	const rendererProps = $derived.by(() =>
		resolveRendererProps(renderTarget, finalKlass, finalAs, finalRestProps)
	);

	function forwardChildren(...args: unknown[]) {
		return (children as ((...args: unknown[]) => unknown) | undefined)?.(...args);
	}
</script>

<RendererComponent {...rendererProps} children={forwardChildren} />
