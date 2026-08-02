<script lang="ts" generics="T extends HtmlElementTagName">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { MotionTransitionFunction } from '$ixirjs/ui/preset';
	import { toClassValue } from '$ixirjs/ui/utils';
	import { withDefaultBorder } from './class';
	import { createPresentation } from '$ixirjs/ui/components/atom/presentation.svelte';
	import { extractMotion, resolveMotionLayers } from '$ixirjs/ui/components/atom/resolve/motion';
	import { stopMotion } from './motion-host';
	import type { ElementType, HtmlElementProps, HtmlElementTagName } from './types';

	type Element = ElementType<T>;

	let {
		class: klass = '',
		as = 'div' as T,
		preset: presetKey = undefined,
		variants = undefined,
		defaults = undefined,
		motion: motionProp = undefined,
		__resolvedPresentation = false,
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

	let node = $state<Element>();
	// with an enter transition, defer animate() until it ends
	let hasEntered = $state<boolean | undefined>();
	// Transition callbacks can run after the component effect is paused for outro. Snapshot the
	// resolved functions outside the reactive graph so teardown never reads an inert derived.
	const transitionMotion: {
		enter: MotionTransitionFunction<Element> | undefined;
		exit: MotionTransitionFunction<Element> | undefined;
	} = { enter: undefined, exit: undefined };
	// guards initial() to a single mount-time invocation
	let hasInitialized = false;

	$effect(() => {
		if (!node) return;

		const unmount = untrack(() => onmount?.(node!));

		return () => {
			if (typeof unmount === 'function') unmount(node!);
			ondestroy?.(node!);
		};
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

	const attachFunction = (n: Element) => {
		node = n;
	};

	// Renderer mode is an initialization-only internal prop from HtmlAtom.
	const resolvedPresentation = untrack(() => __resolvedPresentation);
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
	const resolvedInitial = $derived(resolvedMotion?.initial);
	const resolvedEnter = $derived(resolvedMotion?.enter);
	const resolvedExit = $derived(resolvedMotion?.exit);
	const resolvedAnimate = $derived(resolvedMotion?.animate);
	$effect.pre(() => {
		transitionMotion.enter = resolvedEnter;
		transitionMotion.exit = resolvedExit;
	});
	const finalKlass = $derived(
		withDefaultBorder(resolvedPresentation ? toClassValue(klass) : (presentation?.class ?? ''))
	);
	const finalAs = $derived(String(resolvedPresentation ? as : (presentation?.as ?? as)));
	const hasTransitions = $derived(!!(resolvedEnter ?? resolvedExit));

	// attach transition-end handlers only when transitions exist — they can't fire on a bare element
	const elementProps = $derived.by(() => {
		const base = resolvedPresentation ? { ...restProps } : { ...(presentation?.attrs ?? {}) };
		if (hasTransitions) {
			base.onintroend = handleIntroEnd;
			base.onoutroend = handleExitEnd;
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose passthrough spread onto a polymorphic element; `unknown` values can't satisfy attribute types
		return base as Record<string, any>;
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

	function applyInitial(node: Element) {
		if (!node) return;
		if (hasInitialized) return;
		hasInitialized = true;
		untrack(() => resolvedInitial?.(node!));
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
