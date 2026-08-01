<script lang="ts">
	import { Tooltip } from '$lib/components/tooltip';
	import { Button } from '$lib/components/button';
</script>

<div class="flex items-center justify-center p-8">
	<Tooltip.Root offset={0}>
		<Tooltip.Trigger base={Button} variant="outline">With Arrow</Tooltip.Trigger>
		<Tooltip.Content
			class="border-border bg-popover text-popover-foreground z-50 rounded-md border px-3 py-1.5 text-sm shadow-md"
		>
			<Tooltip.Arrow class="fill-popover" />
			Tooltip with arrow
		</Tooltip.Content>
	</Tooltip.Root>
</div>
