<script lang="ts">
	// One unit is one MENU ITEM. Items sit directly under an open root rather than inside `Content`
	// on both sides: a portal renders nothing on the server, so inside one this fixture would
	// measure an empty page. An item's cost does not depend on a portal being in its ancestry.
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

<DropdownMenu.Root open>
	<DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
	{#each { length: n } as _, i (i)}
		<DropdownMenu.Item class={tint}>Item {i}</DropdownMenu.Item>
	{/each}
	<DropdownMenu.Item class={bump}>Probe</DropdownMenu.Item>
</DropdownMenu.Root>
