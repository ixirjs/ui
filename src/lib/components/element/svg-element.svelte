<svelte:options namespace="svg" />

<script lang="ts" generics="T extends SvgElementTagName">
	import type { SVGAttributes } from 'svelte/elements';
	import { cn, toClassValue } from '$ixirjs/ui/utils';
	import { createPresentation } from '$ixirjs/ui/kernel/presentation.svelte';
	import { extractMotion } from '$ixirjs/ui/kernel/resolve/motion';
	import { useElementMotion } from './use-element-motion.svelte';
	import type { ElementType, SvgElementProps, SvgElementTagName } from './types';

	type Element = ElementType<T>;

	let {
		class: klass = '',
		as = 'g',
		preset: presetKey = undefined,
		variants = undefined,
		defaults = undefined,
		motion: motionProp = undefined,
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
	}: SvgElementProps<T> & Omit<SVGAttributes<Element>, keyof SvgElementProps<T>> = $props();

	const directMotion = $derived(
		extractMotion({ motion: motionProp, initial, enter, exit, animate })
	);
	const presentation = createPresentation({
		preset: () => presetKey,
		variants: () => variants,
		defaults: () => defaults,
		motion: () => directMotion,
		class: () => klass,
		as: () => as,
		restProps: () => restProps
	});
	const motion = useElementMotion<Element>({
		motion: () => presentation.motion,
		onmount: () => onmount,
		ondestroy: () => ondestroy,
		onintroend: () => onintroend,
		onexitend: () => onexitend,
		once: false
	});

	const finalKlass = $derived(cn(toClassValue(presentation.class)));
	const finalAs = $derived(presentation.as as T);
	const hasTransitions = $derived(motion.hasTransitions);
	const elementProps = $derived.by(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose passthrough spread onto a polymorphic element; `unknown` values can't satisfy attribute types
		return motion.decorate({ ...presentation.attrs }) as Record<string, any>;
	});

	const { applyInitial, enterTransition, exitTransition } = motion;
	const attachFunction = motion.attach;
</script>

{@render (!hasTransitions ? bareElement : global ? globalTransition : localTransition)()}

{#snippet bareElement()}
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

{#snippet globalTransition()}
	<svelte:element
		this={finalAs}
		{@attach applyInitial}
		{@attach attachFunction}
		class={finalKlass}
		in:enterTransition|global
		out:exitTransition|global
		{...elementProps}
	>
		{@render children?.()}
	</svelte:element>
{/snippet}

{#snippet localTransition()}
	<svelte:element
		this={finalAs}
		{@attach applyInitial}
		{@attach attachFunction}
		class={finalKlass}
		in:enterTransition
		out:exitTransition
		{...elementProps}
	>
		{@render children?.()}
	</svelte:element>
{/snippet}
