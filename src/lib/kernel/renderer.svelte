<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Body = Snippet<[any]> | Snippet;

	let {
		component: Renderer,
		props,
		children = undefined,
		bodyArg = undefined,
		forwardBodyArg = false
	}: {
		component: Component;
		props: Record<string | symbol, unknown>;
		children?: Body;
		bodyArg?: unknown;
		forwardBodyArg?: boolean;
	} = $props();

	function forwardChildren(...args: unknown[]) {
		return (children as ((...values: unknown[]) => unknown) | undefined)?.(...args);
	}
</script>

<Renderer {...props} children={forwardBodyArg ? forwardChildren : fixedChildren} />

{#snippet fixedChildren()}
	{@render children?.(bodyArg)}
{/snippet}
