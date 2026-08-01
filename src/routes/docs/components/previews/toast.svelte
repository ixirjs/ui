<script lang="ts">
	import { Button } from '$lib/components/button';
	import { Toast } from '$lib/components/toast';

	let toastVisible = $state(false);
</script>

<div class="flex flex-col items-center gap-3">
	<Button size="sm" onclick={() => (toastVisible = true)}>Show notification</Button>
	<Toast.Root
		bind:open={toastVisible}
		duration={3000}
		onopenchange={(open) => {
			if (!open) toastVisible = false;
		}}
		class={[
			'border-border bg-card text-card-foreground relative w-52 rounded-lg border p-3 shadow-md transition-all duration-300',
			toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
		]}
	>
		<Toast.Title class="text-sm font-medium">Saved successfully!</Toast.Title>
		<Toast.Description class="text-muted-foreground text-xs mt-0.5">
			Your changes have been applied.
		</Toast.Description>
	</Toast.Root>
</div>
