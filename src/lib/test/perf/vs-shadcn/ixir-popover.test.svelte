<script module lang="ts">
	// Installed once at module scope — the recommended app setup — rather than per-render
	// `setPreset`. See preset/context.svelte.ts `installPreset`.
	import { defaultPreset, installPreset } from '$ixirjs/ui/preset';

	installPreset(defaultPreset);
</script>

<script lang="ts">
	// One unit is one OPEN POPOVER: trigger + content, the shape a page actually ships.
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover } from '$ixirjs/ui/components/popover';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

<Root>
	{#each { length: n } as _, i (i)}
		<Popover.Root open>
			<Popover.Trigger>Open {i}</Popover.Trigger>
			<Popover.Content class={tint}>Content {i}</Popover.Content>
		</Popover.Root>
	{/each}

	<Popover.Root open>
		<Popover.Trigger>Probe</Popover.Trigger>
		<Popover.Content class={bump}>Probe</Popover.Content>
	</Popover.Root>
</Root>
