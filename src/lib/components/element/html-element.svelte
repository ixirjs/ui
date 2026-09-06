<script lang="ts" generics="T extends HtmlElementTagName">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { toClassValue } from '$ixirjs/ui/utils';
	import { withDefaultBorder } from './class';
	import { createPresentation } from '$ixirjs/ui/kernel/presentation.svelte';
	import { extractMotion, resolveMotionLayers } from '$ixirjs/ui/kernel/resolve/motion';
	import { useElementMotion } from './use-element-motion.svelte';
	import {
		divLocal,
		dynamicLocal,
		divGlobal,
		dynamicGlobal,
		type ElementBody,
		type ElementBranch,
		type ElementView
	} from '$ixirjs/ui/kernel/render/element-branches.svelte';
	import type { ElementType, HtmlElementProps, HtmlElementTagName } from './types';

	type Element = ElementType<T>;

	let {
		class: klass = '',
		as = 'div' as T,
		preset: presetKey = undefined,
		variants = undefined,
		defaults = undefined,
		motion: motionProp = undefined,
		__presentationResolved = false,
		global = true,
		initial = undefined,
		enter = undefined,
		exit = undefined,
		animate = undefined,
		onmount = undefined,
		ondestroy = undefined,
		onintroend = undefined,
		onexitend = undefined,
		children = undefined,
		...restProps
	}: HtmlElementProps<T> & Omit<HTMLAttributes<Element>, keyof HtmlElementProps<T>> = $props();

	// Kernel marks already-resolved presentation at initialization.
	const resolvedPresentation = untrack(() => __presentationResolved);
	const directMotion = $derived(
		extractMotion({ motion: motionProp, initial, enter, exit, animate })
	);
	const presentation = resolvedPresentation
		? undefined
		: createPresentation({
				preset: () => presetKey,
				variants: () => variants,
				defaults: () => defaults,
				motion: () => directMotion,
				class: () => klass,
				as: () => as,
				restProps: () => restProps
			});
	const resolvedMotion = $derived(
		resolvedPresentation ? resolveMotionLayers<Element>([directMotion]) : presentation?.motion
	);

	const motion = useElementMotion<Element>({
		motion: () => resolvedMotion,
		onmount: () => onmount,
		ondestroy: () => ondestroy,
		onintroend: () => onintroend,
		onexitend: () => onexitend,
		once: true
	});

	const finalKlass = $derived(
		withDefaultBorder(resolvedPresentation ? toClassValue(klass) : (presentation?.class ?? ''))
	);
	const finalAs = $derived(String(resolvedPresentation ? as : (presentation?.as ?? as)));
	const hasTransitions = $derived(motion.hasTransitions);

	// attach transition-end handlers only when transitions exist — they can't fire on a bare element
	const elementProps = $derived.by(() => {
		const base = resolvedPresentation ? { ...restProps } : { ...(presentation?.attrs ?? {}) };
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose passthrough spread onto a polymorphic element; `unknown` values can't satisfy attribute types
		return motion.decorate(base) as Record<string, any>;
	});

	// The shared transition leaves copy and decorate the attrs themselves (`motionAttrs`), so they take
	// them RAW — handing them `elementProps` would decorate twice. Harmless, `decorate` assigning the
	// same two keys, but it would also mean two copies of the attrs per rendered element.
	const rawAttrs = $derived(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same polymorphic spread as above
		(resolvedPresentation ? restProps : (presentation?.attrs ?? {})) as Record<string, any>
	);

	// Only the bare pair reads these now; the transition arms take `motion` whole and destructure it
	// inside the shared snippet.
	const applyInitial = motion.applyInitial;
	const attachFunction = motion.attach;

	// The shared leaves read their operands off a handle rather than taking them as arguments. This
	// file has no Kernel handle, so it presents one — built ONCE, over the `$derived`s above, so the
	// closures are per-instance and not per-render.
	//
	// `spread` is the class folded into the attrs, memoized on the same derived chain, because that
	// is what the leaves consume: they no longer set `class` separately and so copy nothing.
	// Typed aliases preserve optional arguments without per-call default-value signals.
	const bareDiv: ElementBranch = bareDivLeaf;
	const bareElement: ElementBranch = bareElementLeaf;
	const viewSpread = $derived({ class: finalKlass, ...rawAttrs });
	const view = {
		tag: () => finalAs,
		spread: () => viewSpread,
		motion: () => motion
	};
</script>

<!-- The rich path had no literal-div branch, so every element it rendered paid `<svelte:element>`'s
     three hydration anchors where a static tag pays one. The bare pair below has had that branch for a
     while; the TRANSITION arms did not, and they are the ones this file exists for.

     They do now, by delegating to the same `element-branches.svelte` the other two seams render
     through. The reason they could not before was real but narrower than it read: `{@attach}` and
     `in:`/`out:` are inline-only and cannot be passed or forwarded — but the shared snippets INLINE
     them, and take the motion instance as an ordinary parameter. So the syntax never crosses the
     boundary; only the rune does.

     The bare pair stays local, because the shared `divBranch`/`dynamicBranch` deliberately ignore
     motion and attach nothing. A bare `HtmlElement` still needs `attach` — that is what drives
     `animate`, `onmount` and `ondestroy` on an element with no transition. Sharing that pair would
     need two more leaves, which nothing else can reach today. -->
{@render (!hasTransitions
	? finalAs === 'div'
		? bareDiv
		: bareElement
	: global
		? finalAs === 'div'
			? divGlobal
			: dynamicGlobal
		: finalAs === 'div'
			? divLocal
			: dynamicLocal)(view, children)}

<!-- The pair takes the same two parameters as the shared leaves so the single ternary dispatch above
     stays one call signature; both read their operands from this component's own state instead,
     `elementProps` being the decorated attrs the shared leaves derive for themselves. -->
{#snippet bareDivLeaf(_view: ElementView, _body: ElementBody | undefined)}
	<div {@attach applyInitial} {@attach attachFunction} class={finalKlass} {...elementProps}>
		{@render children?.()}
	</div>
{/snippet}

{#snippet bareElementLeaf(_view: ElementView, _body: ElementBody | undefined)}
	<svelte:element
		this={finalAs}
		{@attach applyInitial}
		{@attach attachFunction}
		class={finalKlass}
		{...elementProps}
	>
		{@render children?.()}
	</svelte:element>
{/snippet}
