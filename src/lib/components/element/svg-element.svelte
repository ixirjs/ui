<svelte:options namespace="svg" />

<script lang="ts" generics="T extends SvgElementTagName">
	import { untrack } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import type { MotionTransitionFunction } from '$ixirjs/ui/preset';
	import { cn, toClassValue } from '$ixirjs/ui/utils';
	import { createPresentation } from '$ixirjs/ui/components/atom/presentation.svelte';
	import { extractMotion } from '$ixirjs/ui/components/atom/resolve/motion';
	import { stopMotion } from './motion-host';
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

	let node = $state<Element>();
	// with an enter transition, defer animate() until it ends
	let hasEntered = $state<boolean | undefined>();
	// Transition callbacks can run after the component effect is paused for outro. Snapshot the
	// resolved functions outside the reactive graph so teardown never reads an inert derived.
	const transitionMotion: {
		enter: MotionTransitionFunction<Element> | undefined;
		exit: MotionTransitionFunction<Element> | undefined;
	} = { enter: undefined, exit: undefined };

	$effect(() => {
		if (!node) return;

		const unmount = untrack(() => onmount?.(node!));

		return () => {
			if (typeof unmount === 'function') unmount(node!);
			ondestroy?.(node!);
		};
	});

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
	const resolvedMotion = $derived(presentation.motion);
	const resolvedInitial = $derived(resolvedMotion.initial);
	const resolvedEnter = $derived(resolvedMotion.enter);
	const resolvedExit = $derived(resolvedMotion.exit);
	const resolvedAnimate = $derived(resolvedMotion.animate);
	$effect.pre(() => {
		transitionMotion.enter = resolvedEnter;
		transitionMotion.exit = resolvedExit;
	});

	$effect(() => {
		if (hasEntered !== undefined) return;
		hasEntered = !resolvedEnter;
	});

	$effect(() => {
		if (!hasEntered || !node) return;
		const currentNode = node;
		const cleanup = resolvedAnimate?.(currentNode);
		return () => stopMotion(cleanup, currentNode);
	});
	const finalKlass = $derived(cn(toClassValue(presentation.class)));
	const finalAs = $derived(presentation.as as T);
	const hasTransitions = $derived(!!(resolvedEnter ?? resolvedExit));
	const elementProps = $derived.by(() => {
		const props = { ...presentation.attrs };
		if (hasTransitions) {
			props.onintroend = handleIntroEnd;
			props.onoutroend = handleExitEnd;
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose passthrough spread onto a polymorphic element; `unknown` values can't satisfy attribute types
		return props as Record<string, any>;
	});

	function handleIntroEnd(ev: TransitionEvent) {
		onintroend?.(ev);
		if (ev.defaultPrevented) return;
		hasEntered = true;
	}

	function handleExitEnd(ev: TransitionEvent) {
		onexitend?.(ev);
	}

	function enterTransition(node: Element) {
		return transitionMotion.enter?.(node) ?? {};
	}

	function exitTransition(node: Element) {
		return transitionMotion.exit?.(node) ?? {};
	}

	function applyInitial(currentNode: Element) {
		untrack(() => resolvedInitial?.(currentNode));
	}

	function attachFunction(currentNode: Element) {
		node = currentNode;
	}
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
