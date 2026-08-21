<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { children: Snippet; class?: string };

	let { children, class: className = '' }: Props = $props();
</script>

<p class={['text-muted-foreground m-0 text-[14.5px] leading-[1.65]', className]}>
	{@render children()}
</p>
