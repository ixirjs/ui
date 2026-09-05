<script module lang="ts">
	// Installed once at module scope — the recommended app setup — rather than per-render
	// `setPreset`. See preset/context.svelte.ts `installPreset`.
	import { defaultPreset, installPreset } from '$ixirjs/ui/preset';

	installPreset(defaultPreset);
</script>

<script lang="ts">
	import { Button } from '$ixirjs/ui/components/button';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '', onpress = undefined }: FixtureProps = $props();
</script>

{#each { length: n } as _, i (i)}
	<Button onclick={onpress} class={tint}>Press {i}</Button>
{/each}

<Button onclick={onpress} class={bump}>Probe</Button>
