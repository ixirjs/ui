<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fastClass, getSeed } from './fast-context';

	let { children }: { children?: Snippet } = $props();
	const seed = getSeed();
	const klass = fastClass('card-header border-border space-y-1.5 px-4 py-4 $preset', 'card.header');
</script>

<div class={klass} id="card-header-{seed}">{@render children?.()}</div>
