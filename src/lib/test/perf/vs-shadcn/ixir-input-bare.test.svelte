<script module lang="ts">
	import { defaultPreset, installPreset } from '$ixirjs/ui/preset';

	installPreset(defaultPreset);
</script>

<script lang="ts">
	// One unit is one TEXT FIELD rendered as the control alone — no Root, so no Bond, no group
	// element and no Placeholder gating. The skeleton matches shadcn's bare `<input>`; the gap that
	// remains is the seam itself.
	import { InputTextControl } from '$ixirjs/ui/components/input';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

{#each { length: n } as _, i (i)}
	<InputTextControl class={tint} placeholder="Field {i}" />
{/each}

<InputTextControl class={bump} placeholder="Probe" />
