<svelte:options namespace="svg" />

<script lang="ts" generics="T extends SvgElementTagName">
	import { untrack } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { createAttachmentKey } from 'svelte/attachments';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import type { ElementType, SvgElementProps, SvgElementTagName } from './types';

	type Element = ElementType<T>;

	let {
		class: klass = '',
		as = 'g',
		global = true,
		initial = undefined,
		enter = undefined,
		exit = undefined,
		animate = undefined,
		onmount = undefined,
		ondestroy = undefined,
		onintroend = undefined,
		children = undefined,
		...restProps
	}: SvgElementProps<T> & Omit<SVGAttributes<Element>, keyof SvgElementProps<T>> = $props();

	let node = $state<Element>();
	// with an enter transition, defer animate() until it ends
	let hasEntered = $state(!(untrack(() => enter) ?? false));

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

	const elementProps = $derived({
		[createAttachmentKey()]: (n: Element) => {
			node = n;
		},
		class: cn(toClassValue(klass)),
		onintroend: (ev: TransitionEvent) => {
			onintroend?.(ev);
			if (ev.defaultPrevented) return;

			hasEntered = true;
		},
		...restProps
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose passthrough spread onto a polymorphic element; `unknown` values can't satisfy attribute types
	}) as Record<string, any>;

	const transitionSnippet = $derived(global ? globalTransition : localTransition);

	function enterTransition(node: Element) {
		initial?.(node);

		return enter?.(node) ?? {};
	}

	function exitTransition(node: Element) {
		return exit?.(node) ?? {};
	}
</script>

{#snippet globalTransition()}
	<svelte:element
		this={as}
		class={cn(toClassValue(klass))}
		in:enterTransition|global
		out:exitTransition|global
		{...elementProps}
	>
		{@render children?.()}
	</svelte:element>
{/snippet}

{#snippet localTransition()}
	<svelte:element
		this={as}
		class={cn(toClassValue(klass))}
		in:enterTransition
		out:exitTransition
		{...elementProps}
	>
		{@render children?.()}
	</svelte:element>
{/snippet}

{@render transitionSnippet()}
