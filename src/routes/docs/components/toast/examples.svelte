<script lang="ts">
	import { Toast, Toaster } from '$lib/components/toast';
	import { Button } from '$lib/components/button';
	import { DocExample } from '$docs/components';

	interface ToastData {
		title: string;
		description?: string;
	}

	let {
		basicCode,
		declarativeCode,
		autoDismissCode
	}: {
		basicCode: string;
		declarativeCode: string;
		autoDismissCode: string;
	} = $props();

	const toaster = new Toaster();

	let declarativeOpen = $state(true);
	let autoDismissOpen = $state(true);
</script>

<DocExample
	title="Toast Variants"
	description="Trigger different toast types using the Toaster manager."
	code={basicCode}
>
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
</DocExample>

<DocExample
	title="Declarative"
	description="Toast.Root owned entirely by markup — no manager required."
	code={declarativeCode}
>
	<div class="flex flex-col gap-3">
		<Button onclick={() => (declarativeOpen = !declarativeOpen)}>
			{declarativeOpen ? 'Hide' : 'Show'} toast
		</Button>
		<div class="relative w-80">
			<Toast.Root
				bind:open={declarativeOpen}
				duration={0}
				class={[
					'relative flex w-80 flex-col gap-1 rounded-md border border-border bg-card p-4 pr-8 shadow-md transition-opacity',
					!declarativeOpen && 'invisible'
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
			{#if !declarativeOpen}
				<div
					aria-hidden="true"
					class="absolute inset-0 animate-pulse rounded-md border-2 border-dashed border-border"
				></div>
			{/if}
		</div>
	</div>
</DocExample>

<DocExample
	title="Auto-dismiss"
	description="Pass duration to auto-close after the given number of milliseconds."
	code={autoDismissCode}
>
	<div class="flex flex-col gap-3">
		<Button onclick={() => (autoDismissOpen = true)}>Trigger 3s toast</Button>
		<div class="relative w-80">
			<Toast.Root
				bind:open={autoDismissOpen}
				duration={3000}
				onclose={() => (autoDismissOpen = false)}
				class={[
					'relative flex w-80 flex-col gap-1 rounded-md border border-border bg-card p-4 pr-8 shadow-md transition-opacity',
					!autoDismissOpen && 'invisible'
				]}
			>
				<Toast.Title class="text-sm font-medium leading-tight">Auto-dismiss</Toast.Title>
				<Toast.Description class="text-sm opacity-80">Disappears after 3 seconds.</Toast.Description
				>
				<Toast.Close
					class="absolute top-2 right-2 rounded p-1 opacity-50 transition-opacity hover:opacity-100"
				/>
			</Toast.Root>
			{#if !autoDismissOpen}
				<div
					aria-hidden="true"
					class="absolute inset-0 animate-pulse rounded-md border-2 border-dashed border-border"
				></div>
			{/if}
		</div>
	</div>
</DocExample>

<!-- Imperative toaster render loop -->
<ol class="fixed right-4 bottom-4 z-50 flex flex-col-reverse gap-2" aria-live="polite">
	{#each toaster.toasts as item (item.id)}
		{@const data = item.data as ToastData}
		<Toast.Root
			open={true}
			onclose={() => toaster.dismiss(item.id)}
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
