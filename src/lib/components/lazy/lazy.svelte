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

{@render (err && error ? errorContent : !Lazy ? loading : undefined)?.()}

<!-- `err!` is proven by the dispatch above; narrowing does not cross into a snippet body. -->
{#snippet errorContent()}
	{@render error?.(err!)}
{/snippet}
