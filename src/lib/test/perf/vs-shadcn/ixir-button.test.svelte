<script lang="ts">
	import { Button } from '$ixirjs/ui/components/button';
	import type { FixtureProps } from './props.js';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	// A real app installs the preset, and without one `klass()` answers from the memoised
	// fallback while shadcn runs `cn()` on every element — ~0.8 µs/part the head-to-head was not
	// charging us. perf-vs-shadcn-2026-08.md §17.
	setPreset(defaultPreset);
</script>

{#each { length: n } as _, i (i)}
	<Button class={tint}>Press {i}</Button>
{/each}

<Button class={bump}>Probe</Button>
