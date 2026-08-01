<script lang="ts">
	import { Toast } from '$lib/components/toast';
	import { Button } from '$lib/components/button';

	let open = $state(true);
</script>

<div class="flex flex-col gap-3">
	<Button onclick={() => (open = !open)}>
		{open ? 'Hide' : 'Show'} toast
	</Button>
	<div class="relative w-80">
		<Toast.Root
			bind:open
			duration={0}
			class={[
				'relative flex w-80 flex-col gap-1 rounded-md border border-border bg-card p-4 pr-8 shadow-md transition-opacity',
				!open && 'invisible'
			]}
		>
			<Toast.Title class="text-sm font-medium leading-tight">Declarative toast</Toast.Title>
			<Toast.Description class="text-sm opacity-80"
				>Fully owned by markup — no manager required.</Toast.Description
			>
			<Toast.Close
				class="absolute top-2 right-2 rounded p-1 opacity-50 transition-opacity hover:opacity-100"
			/>
		</Toast.Root>
		{#if !open}
			<div
				aria-hidden="true"
				class="absolute inset-0 animate-pulse rounded-md border-2 border-dashed border-border"
			></div>
		{/if}
	</div>
</div>
