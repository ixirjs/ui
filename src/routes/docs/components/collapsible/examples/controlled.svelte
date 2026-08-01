<script lang="ts">
	import { Collapsible } from '$lib/components/collapsible';
	import { Button } from '$lib/components/button';

	let open = $state(true);
</script>

<div class="w-80 space-y-4">
	<Collapsible.Root bind:open>
		<Collapsible.Header>
			<span>Controlled Collapsible</span>
			<span class="text-muted-foreground text-sm">{open ? 'Open' : 'Closed'}</span>
		</Collapsible.Header>
		<Collapsible.Body>
			<p class="text-sm">This collapsible is controlled by external state.</p>
		</Collapsible.Body>
	</Collapsible.Root>
	<Button onclick={() => (open = !open)} variant="outline" size="sm">Toggle from Outside</Button>
</div>
