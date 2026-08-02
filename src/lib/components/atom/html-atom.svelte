<script
	lang="ts"
	generics="Tag extends keyof HTMLElementTagNameMap = 'div', BaseComponent extends Base = Base, Children extends AnySnippet = Snippet"
>
	import { type Snippet } from 'svelte';
	import { toClassValue } from '$ixirjs/ui/utils';
	import type { PresetKey, PresetLike } from '$ixirjs/ui/preset';
	import type { Bond } from '$ixirjs/ui/shared/bond';
	import {
		mergeAtomPresentationProps,
		type PresentableAtom
	} from '$ixirjs/ui/shared/bond/presentation-props';
	import type { AnySnippet, Base, HtmlAtomProps } from './types';
	import { RootBond } from '$ixirjs/ui/components/root';
	import { HtmlElement } from '$ixirjs/ui/components/element';
	import { withDefaultBorder } from '$ixirjs/ui/components/element/class';
	import SnippetAdapter from './snippet.svelte';
	import { createPresentation } from './presentation.svelte';
	import {
		resolveRendererComponent,
		resolveRendererProps,
		resolveRenderTarget
	} from './render/render-target';
	import { runLifecycle } from './render/lifecycle.svelte';

	const rootBond = RootBond.get();

	type HtmlAtomInternalProps<
		Tag extends keyof HTMLElementTagNameMap,
		BaseComponent extends Base,
		Children extends AnySnippet
	> = WithoutKey<HtmlAtomProps<Tag, BaseComponent, Children>, 'part'> & {
		// Internal defaults layer: applied before preset/variants/rest so presets and users can override.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		defaults?: Record<string, any> | undefined;
		// Internal direct-part seam: avoids materializing and spreading an intermediate props packet.
		// `part` is the whole `usePart(...)` result and is the shape bonded parts use — it carries the
		// atom, bond, preset key, and per-slot layer, so the slot string lives in exactly one place.
		// The four individual props remain accepted for roots, which own a Bond and a root Atom but
		// have no `usePart` result. Explicit props win over the part.
		//
		// `part` is also a real HTML attribute (CSS shadow parts, `::part()`). The two are
		// discriminated by type: an object is the seam, a string is the attribute and is forwarded to
		// the element untouched. Only the string branch copies, and it is off the per-part path.
		part?: DirectPart | string | null | undefined;
		atom?: PresentableAtom;
		// Bond state props used to select preset variants without landing on the DOM as attributes.
		variantProps?: Record<string, unknown> | undefined;
	};

	// `Omit` cannot remove a key here: ElementProps extends Record<string, unknown>, so `keyof` is
	// `string | number`, `Exclude<…, 'part'>` subtracts nothing, and Pick collapses every named prop
	// to the index signature. A homomorphic mapped type with an `as` clause drops the one declared
	// key while preserving the index signature and every other property.
	type WithoutKey<T, K extends PropertyKey> = {
		[P in keyof T as P extends K ? never : P]: T[P];
	};

	// Structural, so this stays a component → shared type dependency of the narrowest possible shape.
	type DirectPart = {
		readonly atom: PresentableAtom;
		readonly bond: Bond | undefined;
		readonly preset: PresetKey | undefined;
		readonly presetLayer: PresetLike | undefined;
	};

	let {
		class: klass = '',
		as = undefined,
		base = undefined,
		preset: presetKey = undefined,
		presetLayer = undefined,
		bond: bondProp = undefined,
		part = undefined,
		atom: atomProp = undefined,
		variants = undefined,
		variantProps = undefined,
		defaults = undefined,
		motion: motionProp = undefined,
		oninit = undefined,
		children: children = undefined,
		...restProps
	}: HtmlAtomInternalProps<Tag, BaseComponent, Children> = $props();

	// One resolution point for the direct seam. Plain functions, not `$derived`: they run inside the
	// thunks the presentation snapshot and lifecycle already own, so the part adds no signal and no
	// allocation — `part`'s members are getters on the object `usePart` already returned.
	// An object `part` is the seam; a string is the DOM shadow-part attribute and owns none of these.
	function seamPart() {
		return typeof part === 'object' && part !== null ? part : undefined;
	}
	function resolvedAtom() {
		return atomProp ?? seamPart()?.atom;
	}
	function resolvedBond() {
		return bondProp ?? seamPart()?.bond;
	}
	function resolvedPresetKey() {
		return presetKey ?? seamPart()?.preset ?? (resolvedAtom()?.preset as PresetKey | undefined);
	}
	function resolvedPresetLayer() {
		return presetLayer ?? seamPart()?.presetLayer;
	}

	function effectiveRestProps() {
		// Cold branch: `part` was the HTML attribute, so put it back on the element. This is the one
		// path that copies, and it is never the per-part seam path.
		const rest = typeof part === 'string' ? { ...restProps, part } : restProps;
		const atomInstance = resolvedAtom();
		return atomInstance ? mergeAtomPresentationProps(atomInstance, rest) : rest;
	}

	// Bond lifecycle attachments (createLifecycleKey): fire each phase's `(bond) => …` callbacks
	// against the live bond. The lifecycle keys are symbol-keyed, so Svelte ignores them on the
	// DOM spread downstream — `restProps` flows on untouched.
	runLifecycle(effectiveRestProps, resolvedBond, () => oninit);

	// Full HtmlAtom and lightweight native/SVG adapters share this presentation seam.
	const presentation = createPresentation({
		preset: resolvedPresetKey,
		bond: resolvedBond,
		instance: resolvedPresetLayer,
		variants: () => variants,
		variantProps: () => variantProps,
		defaults: () => defaults,
		class: () => klass,
		as: () => as,
		base: () => base,
		motion: () => motionProp,
		restProps: effectiveRestProps
	});
	// The renderer slot: HtmlElement unless a Root overrides it. `__resolvedPresentation` is part of
	// this slot's contract, so only the component filling it may be told presentation is resolved.
	const defaultRenderer = $derived(rootBond?.props?.renderers?.html ?? HtmlElement);
	// Render-target normalization names the component/snippet decision in one place. Presentation
	// is already one tracked snapshot, so avoid re-wrapping each output axis in another signal.
	const renderTarget = $derived(resolveRenderTarget(presentation.base, defaultRenderer));
	// Component identity remains a signal so rich-path target changes remount deliberately.
	const RendererComponent = $derived(resolveRendererComponent(renderTarget, SnippetAdapter));

	// The overwhelmingly common path renders the native element here. Previously every part paid
	// for a second Svelte component plus HtmlElement's motion/effect graph even when none of those
	// capabilities were requested. Custom renderers, snippets, motion, and renderer lifecycle hooks
	// retain the rich adapter unchanged.
	function useNativeRenderer() {
		if (renderTarget.kind !== 'component' || renderTarget.component !== HtmlElement) return false;
		// Emptiness by early exit: `Object.keys(...).length` allocated a key array per part per
		// evaluation to answer a yes/no question, and most parts declare no motion at all.
		for (const _ in presentation.motion) return false;
		const attrs = presentation.attrs;
		return !(
			'onmount' in attrs ||
			'ondestroy' in attrs ||
			'onintroend' in attrs ||
			'onexitend' in attrs ||
			'global' in attrs
		);
	}

	function getRendererProps() {
		return resolveRendererProps(
			renderTarget,
			presentation.class,
			presentation.as,
			presentation.attrs,
			presentation.motion,
			{
				// Only the renderer slot understands this flag. A `base` naming some other component
				// resolves its own presentation and must never receive it.
				presentationResolved:
					renderTarget.kind === 'component' && renderTarget.component === defaultRenderer
			}
		);
	}

	function forwardChildren(...args: unknown[]) {
		return (children as ((...args: unknown[]) => unknown) | undefined)?.(...args);
	}
</script>

<!-- Literal-div fast path: `<svelte:element>` emits three hydration-anchor comments per element
     while a static tag emits none, and `div` is the default and overwhelmingly common tag. The
     branch rides the render ternary's existing dynamic callee, so it adds no anchor of its own.
     See docs/research/hydration-anchor-diet-2026-08.md. -->
{#snippet nativeDiv()}
	<div class={withDefaultBorder(toClassValue(presentation.class))} {...presentation.attrs}>
		{@render (children as Snippet | undefined)?.()}
	</div>
{/snippet}

{#snippet native()}
	<svelte:element
		this={String(presentation.as ?? 'div')}
		class={withDefaultBorder(toClassValue(presentation.class))}
		{...presentation.attrs}
	>
		{@render (children as Snippet | undefined)?.()}
	</svelte:element>
{/snippet}

{#snippet renderer()}
	<RendererComponent {...getRendererProps()} children={forwardChildren} />
{/snippet}

{@render (useNativeRenderer()
	? (presentation.as ?? 'div') === 'div'
		? nativeDiv
		: native
	: renderer)()}
