<script lang="ts">
	// Scoped preset override. `setPreset` merges over whatever the ancestor published, and it does
	// that once at init — so a caller that wants to *swap* presets wraps this in `{#key}`, which is
	// exactly what the home page's preset switcher does.
	import { setPreset } from '$lib/preset';
	import type { Preset } from '$lib/preset';
	import type { Snippet } from 'svelte';

	let { preset, children }: { preset: Partial<Preset>; children: Snippet } = $props();

	// Intentional: the override is read once, at init. Swapping presets is a `{#key}` remount.
	// svelte-ignore state_referenced_locally
	setPreset(preset);
</script>

{@render children()}
