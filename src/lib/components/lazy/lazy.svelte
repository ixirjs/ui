<script lang="ts" generics="Props extends LazyComponentProps = Record<string, unknown>">
	import { untrack, type Component } from 'svelte';
	import type { LazyComponentProps, LazyProps } from './types';

	let { promise, loading, error, ...loadedProps }: LazyProps<Props> = $props();

	let Lazy: Component<Props> | null = $state(null);

	let err = $state();

	untrack(() =>
		promise
			.then((c) => {
				Lazy = c;
			})
			.catch((r) => {
				err = r;
			})
	);
</script>

<Lazy {...loadedProps as unknown as Props} />

{#if err && error}
	{@render error?.(err)}
{:else if !Lazy}
	{@render loading?.()}
{/if}
