<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover, type PopoverPresets } from '$ixirjs/ui/components/popover';

	let { presets }: { presets: PopoverPresets } = $props();
</script>

<Root>
	<Popover.Root open {presets}>
		{#snippet children()}
			<Popover.Trigger>Open</Popover.Trigger>
			<Popover.Content>
				<Popover.Tail />
				<Popover.Indicator />
				Panel
			</Popover.Content>
		{/snippet}
	</Popover.Root>
</Root>
