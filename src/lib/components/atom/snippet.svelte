<script lang="ts" generics="Parameters extends Record<string, unknown> = Record<string, unknown>">
	import type { Snippet } from 'svelte';

	type Props = Parameters & {
		snippet?: Snippet<[Parameters]>;
	};
	let { snippet, ...restProps }: Props = $props();
</script>

{@render snippet?.(restProps as Parameters)}
