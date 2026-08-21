<script lang="ts">
	import { Button } from '$shadcn/shadcn/button/index.js';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

{#each { length: n } as _, i (i)}
	<Button class={tint}>Press {i}</Button>
{/each}

<Button class={bump}>Probe</Button>
