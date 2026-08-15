<script lang="ts" generics="Props extends LazyComponentProps = Record<string, unknown>">
	import type { LazyComponentProps, LazyProps } from './types';

	const { promise, loading, error, ...loadedProps }: LazyProps<Props> = $props();
</script>

{#await promise}
	{@render loading?.()}
{:then Loaded}
	<Loaded {...loadedProps as unknown as Props} />
{:catch err}
	{@render error?.(err)}
{/await}
