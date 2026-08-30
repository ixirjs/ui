<script lang="ts">
	// One unit is one MENU ITEM. Items sit directly under an open root rather than inside `Content`
	// on both sides: a portal renders nothing on the server, so inside one this fixture would
	// measure an empty page. An item's cost does not depend on a portal being in its ancestry.
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';
	import type { FixtureProps } from './props.js';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	// A real app installs the preset, and without one `klass()` answers from the memoised
	// fallback while shadcn runs `cn()` on every element — ~0.8 µs/part the head-to-head was not
	// charging us. perf-vs-shadcn-2026-08.md §17.
	setPreset(defaultPreset);
</script>

<DropdownMenu.Root open>
	<DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
	{#each { length: n } as _, i (i)}
		<DropdownMenu.Item class={tint}>Item {i}</DropdownMenu.Item>
	{/each}
	<DropdownMenu.Item class={bump}>Probe</DropdownMenu.Item>
</DropdownMenu.Root>
