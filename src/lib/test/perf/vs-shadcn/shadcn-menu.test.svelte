<script lang="ts">
	// The vendored shadcn item verbatim (it needs no icon), inside a bits-ui menu whose content is
	// `ContentStatic` + `forceMount` — the non-portalled, always-rendered variant, so the server
	// emits the items instead of an empty portal.
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import DropdownMenuItem from '$shadcn/shadcn/dropdown-menu/dropdown-menu-item.svelte';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

<DropdownMenuPrimitive.Root open>
	<DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger">
		Options
	</DropdownMenuPrimitive.Trigger>
	<DropdownMenuPrimitive.ContentStatic forceMount data-slot="dropdown-menu-content">
		{#each { length: n } as _, i (i)}
			<DropdownMenuItem class={tint}>Item {i}</DropdownMenuItem>
		{/each}
		<DropdownMenuItem class={bump}>Probe</DropdownMenuItem>
	</DropdownMenuPrimitive.ContentStatic>
</DropdownMenuPrimitive.Root>
