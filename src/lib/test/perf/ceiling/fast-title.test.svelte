<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fastClass, getSeed } from './fast-context';

	let { children }: { children?: Snippet } = $props();
	const seed = getSeed();
	const klass = fastClass(
		'card-title border-border text-lg font-semibold leading-none tracking-tight $preset',
		'card.title'
	);
</script>

<h3 class={klass} id="card-title-{seed}">{@render children?.()}</h3>
