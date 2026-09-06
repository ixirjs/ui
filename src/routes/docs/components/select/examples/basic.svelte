<script lang="ts">
	import { Select } from '@ixirjs/ui/components/select';
	import { Input } from '@ixirjs/ui/components/input';

	let singleValue = $state<string | undefined>();
</script>

<div class="w-48">
	<Select.Root bind:value={singleValue}>
		{#snippet children({ select })}
			<Select.Trigger base={Input.Root}>
				<span>{singleValue ?? 'Select an option...'}</span>
			</Select.Trigger>
			<Select.Content class="border-border bg-background mt-1 rounded-lg border shadow-lg">
				<Select.Item value="apple">Apple</Select.Item>
				<Select.Item value="banana">Banana</Select.Item>
				<Select.Item value="cherry">Cherry</Select.Item>
			</Select.Content>
			<!-- Read the root-owned interface; no factory or manual teardown. -->
			<code class="text-muted-foreground block font-mono text-xs"
				>profile: {select.profile.name} · open: {String(select.isOpen)}</code
			>
		{/snippet}
	</Select.Root>
</div>
