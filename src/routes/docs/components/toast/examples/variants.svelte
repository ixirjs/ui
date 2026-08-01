<script lang="ts">
	import { Toast, Toaster } from '$lib/components/toast';
	import { Button } from '$lib/components/button';

	interface ToastData {
		title: string;
		description?: string;
	}

	const toaster = new Toaster();
</script>

<div class="flex flex-wrap gap-2">
	<Button onclick={() => toaster.add('default', { data: { title: 'Hello!' } as ToastData })}
		>Default</Button
	>
	<Button
		onclick={() =>
			toaster.add('info', {
				data: { title: 'Heads up', description: 'Just so you know.' } as ToastData
			})}>Info</Button
	>
	<Button
		onclick={() =>
			toaster.add('success', {
				data: { title: 'Saved!', description: 'Changes have been persisted.' } as ToastData
			})}>Success</Button
	>
	<Button
		onclick={() =>
			toaster.add('warning', {
				data: { title: 'Careful', description: 'Storage is almost full.' } as ToastData
			})}>Warning</Button
	>
	<Button
		onclick={() =>
			toaster.add('error', {
				data: { title: 'Error', description: 'Something went wrong.' } as ToastData
			})}>Error</Button
	>
	<Button onclick={() => toaster.clear()}>Clear all</Button>
</div>

<ol class="fixed right-4 bottom-4 z-50 flex flex-col-reverse gap-2" aria-live="polite">
	{#each toaster.toasts as item (item.id)}
		{@const data = item.data as ToastData}
		<Toast.Root
			open={true}
			onopenchange={(open) => {
				if (!open) toaster.dismiss(item.id);
			}}
			class="relative flex w-80 flex-col gap-1 rounded-md p-4 pr-8"
			variant={item.type}
		>
			<Toast.Title class="text-sm font-medium leading-tight">{data.title}</Toast.Title>
			{#if data.description}
				<Toast.Description class="text-sm opacity-80">{data.description}</Toast.Description>
			{/if}
			<Toast.Close
				class="absolute top-2 right-2 rounded p-1 opacity-50 transition-opacity hover:opacity-100"
				onclick={() => toaster.dismiss(item.id)}
			/>
		</Toast.Root>
	{/each}
</ol>
