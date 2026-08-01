<script lang="ts">
	import { Tooltip } from '$lib/components/tooltip';
	import { Button } from '$lib/components/button';
</script>

<div class="flex items-center justify-center p-8">
	<Tooltip.Root>
		<Tooltip.Trigger base={Button} variant="outline">Hover me</Tooltip.Trigger>
		<Tooltip.Content
			class="border-border bg-popover text-popover-foreground z-50 rounded-md border px-3 py-1.5 text-sm shadow-md"
		>
			This is a tooltip
		</Tooltip.Content>
	</Tooltip.Root>
</div>
