<script module lang="ts">
	// Installed once at module scope — the recommended app setup — rather than per-render
	// `setPreset`. See preset/context.svelte.ts `installPreset`.
	import { defaultPreset, installPreset } from '$ixirjs/ui/preset';

	installPreset(defaultPreset);
</script>

<script lang="ts">
	// One unit is one TEXT FIELD. shadcn ships a bare `<input>`; ours is a Root that owns the state
	// plus a Control that renders the element — so the skeletons differ by construction, and the
	// census prints it rather than hiding it.
	import { Input } from '$ixirjs/ui/components/input';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

{#each { length: n } as _, i (i)}
	<Input.Root>
		<Input.TextControl class={tint} placeholder="Field {i}" />
	</Input.Root>
{/each}

<Input.Root>
	<Input.TextControl class={bump} placeholder="Probe" />
</Input.Root>
