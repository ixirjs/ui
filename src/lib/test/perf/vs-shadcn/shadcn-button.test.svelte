<script lang="ts">
	import { Button } from '$shadcn/shadcn/button/index.js';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '', onpress = undefined }: FixtureProps = $props();
</script>

{#each { length: n } as _, i (i)}
	<Button onclick={onpress} class={tint}>Press {i}</Button>
{/each}

<Button onclick={onpress} class={bump}>Probe</Button>
