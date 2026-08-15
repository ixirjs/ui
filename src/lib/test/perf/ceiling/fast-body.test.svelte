<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fastClass, getSeed } from './fast-context';

	let { children }: { children?: Snippet } = $props();
	const seed = getSeed();
	const klass = fastClass('card-content border-border px-4 pb-4 $preset', 'card.content');
</script>

<div class={klass} id="card-content-{seed}">{@render children?.()}</div>
