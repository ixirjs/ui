<script lang="ts">
	import { Input } from '$shadcn/shadcn/input/index.js';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

{#each { length: n } as _, i (i)}
	<Input class={tint} placeholder="Field {i}" />
{/each}

<Input class={bump} placeholder="Probe" />
