<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Toast as Toast_, Toaster } from '..';
	import { Button } from '../../button';

	const { Story } = defineMeta({
		title: 'Atoms/Toast',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			disabled: false,
			duration: 0
		},
		argTypes: {
			disabled: {
				control: 'boolean',
				description: 'Prevent the toast from being opened or dismissed by the user.'
			},
			duration: {
				control: 'number',
				description:
					'Auto-dismiss delay in milliseconds. Set to 0 to disable auto-dismiss. Default: 0.',
				table: { defaultValue: { summary: '0' } }
			}
		}
	});
</script>

<script lang="ts">
	interface ToastData {
		title: string;
		description?: string;
	}

	const toaster = new Toaster();

	let defaultOpen = $state(false);
	let declarativeOpen = $state(false);
	let autoDismissOpen = $state(false);
</script>

<!-- Configurable single declarative toast with Storybook controls. -->
<Story name="Basic">
	{#snippet template(args)}
		<div class="flex h-screen flex-col items-center justify-center gap-4">
			<Button onclick={() => (defaultOpen = !defaultOpen)}>
				{defaultOpen ? 'Hide' : 'Show'} toast
			</Button>
			<Toast_.Root
				bind:open={defaultOpen}
				disabled={args.disabled}
				duration={args.duration}
				onclose={() => (defaultOpen = false)}
			>
				<Toast_.Title>Notification</Toast_.Title>
				<Toast_.Description>
					This is a configurable toast. Use the controls panel to adjust its behaviour.
				</Toast_.Description>
				<Toast_.Close />
			</Toast_.Root>
		</div>
	{/snippet}
</Story>

<!-- Wires the Toaster manager's item list to Toast.Root. -->
<Story name="Custom toaster">
	<div class="flex h-screen flex-col items-center justify-center gap-4">
		<div class="flex flex-wrap justify-center gap-2">
			<Button onclick={() => toaster.add('default', { data: { title: 'Hello!' } as ToastData })}
				>Default</Button
			>
			<Button
				onclick={() =>
					toaster.add('info', {
						data: { title: 'Heads up', description: 'Just a heads up.' } as ToastData
					})}>Info</Button
			>
			<Button
				onclick={() =>
					toaster.add('success', {
						data: { title: 'Saved!', description: 'Changes persisted.' } as ToastData
					})}>Success</Button
			>
			<Button
				onclick={() =>
					toaster.add('warning', {
						data: { title: 'Careful', description: 'Storage almost full.' } as ToastData
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
	</div>

	<!-- Custom toaster: position + render loop are fully in user-land -->
	<ol class="fixed bottom-4 right-4 flex flex-col-reverse gap-2" aria-live="polite">
		{#each toaster.toasts as item (item.id)}
			{@const data = item.data as ToastData}
			<Toast_.Root open={true} onclose={() => toaster.dismiss(item.id)}>
				<Toast_.Title>{data.title}</Toast_.Title>
				{#if data.description}
					<Toast_.Description>{data.description}</Toast_.Description>
				{/if}
				<Toast_.Close />
			</Toast_.Root>
		{/each}
	</ol>
</Story>

<!-- Auto-dismiss: manager removes toasts after the duration. -->
<Story name="Auto-dismiss">
	<div class="flex h-screen flex-col items-center justify-center gap-4">
		<Button
			onclick={() =>
				toaster.add('default', {
					duration: 3000,
					data: { title: 'Auto-dismiss', description: 'Gone in 3 seconds.' } as ToastData
				})}
		>
			Trigger 3s toast
		</Button>
	</div>

	<ol class="fixed bottom-4 right-4 flex flex-col-reverse gap-2" aria-live="polite">
		{#each toaster.toasts as item (item.id)}
			{@const data = item.data as ToastData}
			<Toast_.Root open={true} onclose={() => toaster.dismiss(item.id)}>
				<Toast_.Title>{data.title}</Toast_.Title>
				{#if data.description}
					<Toast_.Description>{data.description}</Toast_.Description>
				{/if}
				<Toast_.Close />
			</Toast_.Root>
		{/each}
	</ol>
</Story>

<!-- Declarative: Toast.Root owned by markup, no manager. -->
<Story name="Declarative">
	<div class="flex h-screen flex-col items-center justify-center gap-6">
		<div class="flex gap-2">
			<Button onclick={() => (declarativeOpen = !declarativeOpen)}>
				{declarativeOpen ? 'Hide' : 'Show'} toast
			</Button>
			<Button onclick={() => (autoDismissOpen = true)}>Trigger 3s toast</Button>
		</div>

		<Toast_.Root bind:open={declarativeOpen} duration={0}>
			<Toast_.Title>Declarative toast</Toast_.Title>
			<Toast_.Description>Fully owned by markup — no manager required.</Toast_.Description>
			<Toast_.Close />
		</Toast_.Root>

		<Toast_.Root
			bind:open={autoDismissOpen}
			duration={3000}
			onclose={() => (autoDismissOpen = false)}
		>
			<Toast_.Title>Auto-dismiss</Toast_.Title>
			<Toast_.Description>Disappears after 3 seconds.</Toast_.Description>
			<Toast_.Close />
		</Toast_.Root>
	</div>
</Story>
