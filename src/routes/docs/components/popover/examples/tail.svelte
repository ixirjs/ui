<script lang="ts">
	import { Popover } from '$lib/components/popover';
	import { Button } from '$lib/components/button';
</script>

<Popover.Root>
	<Popover.Trigger base={Button} variant="outline">Info</Popover.Trigger>
	<Popover.Content class="border-border bg-background z-10 rounded-lg border p-3 shadow-lg">
		<Popover.Tail class="fill-background" />
		<p class="text-sm">A pointed tail indicates the source of this popover.</p>
	</Popover.Content>
</Popover.Root>
