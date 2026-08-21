<script lang="ts">
	// Select owns the same Bond base as DropdownMenu but overrides `navigableItems`, so it gets its
	// own fixture rather than being assumed covered by `menu`.
	//
	// Wrapped in `Root`: `Select.Content` portals, and without a portal host the options render
	// nowhere — the fixture then measures a trigger and reports a flat curve for any n. The harness
	// fails on exactly that (see `growth-client.svelte.ts`'s scaling assertion), which is how this
	// was caught rather than quietly baselined.
	import { Root } from '$ixirjs/ui/components/root';
	import { Select } from '$ixirjs/ui/components/select';

	let { n = 100 }: { n?: number } = $props();
</script>

<Root>
	<Select.Root open>
		{#snippet children()}
			<Select.Trigger>
				<Select.Placeholder>Choose</Select.Placeholder>
			</Select.Trigger>
			<Select.Content>
				{#each { length: n } as _, i (i)}
					<Select.Item value={String(i)}>Option {i}</Select.Item>
				{/each}
			</Select.Content>
		{/snippet}
	</Select.Root>
</Root>
