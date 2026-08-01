<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Select, type SelectPresets } from '$ixirjs/ui/components/select';

	let { presets }: { presets: SelectPresets } = $props();
</script>

<Root>
	<Select.Root open {presets}>
		{#snippet children()}
			<Select.Trigger>
				<Select.Placeholder>Choose</Select.Placeholder>
				<Select.Query />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="alpha">Alpha</Select.Item>
				<Select.Tail />
				<Select.Indicator />
			</Select.Content>
		{/snippet}
	</Select.Root>
</Root>
