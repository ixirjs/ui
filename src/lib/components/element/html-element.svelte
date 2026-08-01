<script lang="ts" generics="T extends HtmlElementTagName">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import type { ElementType, HtmlElementProps, HtmlElementTagName } from './types';

	type Element = ElementType<T>;

	let {
		class: klass = '',
		as = 'div' as T,
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
	let hasEntered = $state(!(untrack(() => enter) ?? false));
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
		if (!hasEntered) return;
		if (!node) return;

		animate?.(node);
	});

	const attachFunction = (n: Element) => {
		node = n;
	};

	const finalKlass = $derived(cn('border-border',toClassValue(klass)));
	const hasTransitions = $derived(!!(enter ?? exit));
	const transitionSnippet = $derived(
		!hasTransitions ? bareElement : global ? globalTransition : localTransition
	);

	// attach transition-end handlers only when transitions exist — they can't fire on a bare element
	const elementProps = $derived.by(() => {
		const base = { ...restProps };
		if (hasTransitions) {
			base.onintroend = handleIntroEnd;
			base.onoutroend = handleExitEnd;
		}
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
		return enter?.(node) ?? {};
	}

	function exitTransition(node: Element) {
		return exit?.(node) ?? {};
	}

	function applyInitial(node: Element) {
		if (!node) return;
		if (hasInitialized) return;
		hasInitialized = true;
		untrack(() => initial?.(node!));
	}
</script>

{#snippet bareElement()}
	<svelte:element this={as} {@attach applyInitial} {@attach attachFunction} class={finalKlass} {...elementProps}>
		{@render children?.()}
	</svelte:element>
{/snippet}

{#snippet globalTransition()}
	<svelte:element this={as} {@attach applyInitial} {@attach attachFunction} class={finalKlass} in:enterTransition|global out:exitTransition|global {...elementProps}>
		{@render children?.()}
	</svelte:element>
{/snippet}

{#snippet localTransition()}
	<svelte:element this={as} {@attach applyInitial} {@attach attachFunction} class={finalKlass} in:enterTransition out:exitTransition {...elementProps}>
		{@render children?.()}
	</svelte:element>
{/snippet}

{@render transitionSnippet()}
