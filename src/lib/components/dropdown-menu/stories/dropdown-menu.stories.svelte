<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { DropdownMenu as ADropdownMenu } from '..';
	import { Button } from '$svelte-atoms/core/components/button';

	const { Story } = defineMeta({
		title: 'Atoms/DropdownMenu',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			disabled: false,
			placement: 'bottom-start',
			offset: 8
		},
		argTypes: {
			disabled: {
				control: 'boolean',
				description: 'Disable the trigger and prevent the menu from opening'
			},
			placement: {
				control: 'select',
				options: [
					'top',
					'top-start',
					'top-end',
					'bottom',
					'bottom-start',
					'bottom-end',
					'left',
					'left-start',
					'left-end',
					'right',
					'right-start',
					'right-end'
				],
				description: 'Preferred placement of the menu relative to the trigger'
			},
			offset: {
				control: { type: 'number', min: 0, max: 32, step: 2 },
				description: 'Gap in pixels between the trigger and the menu'
			}
		}
	});
</script>

<script lang="ts">
	let open = $state(false);
	let actionOpen = $state(false);
	let profileOpen = $state(false);

	// Each Item takes an `onclick`; surfaced live here instead of console.log.
	let lastAction = $state('—');
	let language = $state('—');
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div
			class="bg-background bg-dot-grid flex h-screen w-full flex-col items-center justify-center gap-4"
		>
			<ADropdownMenu.Root {...args}>
				<ADropdownMenu.Trigger base={Button}>Options</ADropdownMenu.Trigger>
				<ADropdownMenu.Content>
					<ADropdownMenu.Item onclick={() => (lastAction = 'Edit')}>Edit</ADropdownMenu.Item>
					<ADropdownMenu.Item onclick={() => (lastAction = 'Duplicate')}
						>Duplicate</ADropdownMenu.Item
					>
					<ADropdownMenu.Item onclick={() => (lastAction = 'Archive')}>Archive</ADropdownMenu.Item>
					<ADropdownMenu.Divider />
					<ADropdownMenu.Item onclick={() => (lastAction = 'Delete')}>Delete</ADropdownMenu.Item>
				</ADropdownMenu.Content>
			</ADropdownMenu.Root>
			<code class="text-muted-foreground text-xs font-mono">action: {lastAction}</code>
		</div>
	{/snippet}
</Story>

<Story name="Language Selector">
	<div
		class="bg-background bg-dot-grid flex h-screen w-full flex-col items-center justify-center gap-4"
	>
		<ADropdownMenu.Root bind:open>
			<ADropdownMenu.Trigger base={Button}
				>{language === '—' ? 'Select a language' : language}</ADropdownMenu.Trigger
			>
			<ADropdownMenu.Content>
				<ADropdownMenu.Item onclick={() => (language = 'Arabic')}>Arabic</ADropdownMenu.Item>
				<ADropdownMenu.Item onclick={() => (language = 'English')}>English</ADropdownMenu.Item>
				<ADropdownMenu.Item onclick={() => (language = 'Spanish')}>Spanish</ADropdownMenu.Item>
				<ADropdownMenu.Item onclick={() => (language = 'Italian')}>Italian</ADropdownMenu.Item>
			</ADropdownMenu.Content>
		</ADropdownMenu.Root>
		<code class="text-muted-foreground text-xs font-mono">selected: {language}</code>
	</div>
</Story>

<Story name="Row Actions">
	<div class="bg-background flex h-screen flex-col">
		<header class="border-border flex h-14 shrink-0 items-center gap-4 border-b px-6">
			<div class="bg-muted h-3 w-24 rounded-full"></div>
			<div class="ml-auto flex items-center gap-2">
				<div class="bg-muted/60 h-8 w-32 rounded-full"></div>
			</div>
		</header>

		<main class="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-6 py-6">
			<div class="border-border bg-card overflow-hidden rounded-lg border">
				<div class="border-border flex items-center justify-between border-b px-4 py-3">
					<div class="bg-muted h-3 w-32 rounded-full"></div>
					<div class="bg-muted/60 h-2.5 w-16 rounded-full"></div>
				</div>
				<div class="divide-border divide-y">
					{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
						{@const widths = ['w-28', 'w-36', 'w-24', 'w-32', 'w-40', 'w-20']}
						{@const w = widths[i % widths.length]}
						<div class="group flex items-center gap-3.5 px-4 py-3">
							<div class="bg-muted h-2 w-2 shrink-0 rounded-full"></div>
							<div class="min-w-0 flex-1 space-y-1.5">
								<div class={['bg-muted h-3 rounded-full', w]}></div>
								<div class="bg-muted/60 h-2.5 w-40 rounded-full"></div>
							</div>
							<ADropdownMenu.Root placement="bottom-end" placements={['bottom-end', 'top-end']}>
								<ADropdownMenu.Trigger
									class="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-md p-1.5 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
								>
									&#x22EF;
								</ADropdownMenu.Trigger>
								<ADropdownMenu.Content>
									<ADropdownMenu.Item onclick={() => (lastAction = `Edit row ${i + 1}`)}
										>Edit</ADropdownMenu.Item
									>
									<ADropdownMenu.Item onclick={() => (lastAction = `Duplicate row ${i + 1}`)}
										>Duplicate</ADropdownMenu.Item
									>
									<ADropdownMenu.Item onclick={() => (lastAction = `Archive row ${i + 1}`)}
										>Archive</ADropdownMenu.Item
									>
									<ADropdownMenu.Divider />
									<ADropdownMenu.Item onclick={() => (lastAction = `Delete row ${i + 1}`)}
										>Delete</ADropdownMenu.Item
									>
								</ADropdownMenu.Content>
							</ADropdownMenu.Root>
						</div>
					{/each}
				</div>
			</div>
			<p class="text-muted-foreground mt-4 text-sm">Last action: <strong>{lastAction}</strong></p>
		</main>
	</div>
</Story>

<Story name="With Groups">
	<div
		class="bg-background bg-dot-grid flex h-screen w-full flex-col items-center justify-center gap-4"
	>
		<ADropdownMenu.Root bind:open={actionOpen} placement="bottom-start">
			<ADropdownMenu.Trigger base={Button}>Actions</ADropdownMenu.Trigger>
			<ADropdownMenu.Content>
				<ADropdownMenu.Group>
					<ADropdownMenu.Title>File</ADropdownMenu.Title>
					<ADropdownMenu.Item onclick={() => (lastAction = 'New file')}>New file</ADropdownMenu.Item
					>
					<ADropdownMenu.Item onclick={() => (lastAction = 'Open')}>Open...</ADropdownMenu.Item>
					<ADropdownMenu.Item onclick={() => (lastAction = 'Save')}>Save</ADropdownMenu.Item>
				</ADropdownMenu.Group>
				<ADropdownMenu.Divider />
				<ADropdownMenu.Group>
					<ADropdownMenu.Title>Edit</ADropdownMenu.Title>
					<ADropdownMenu.Item onclick={() => (lastAction = 'Cut')}>Cut</ADropdownMenu.Item>
					<ADropdownMenu.Item onclick={() => (lastAction = 'Copy')}>Copy</ADropdownMenu.Item>
					<ADropdownMenu.Item onclick={() => (lastAction = 'Paste')}>Paste</ADropdownMenu.Item>
				</ADropdownMenu.Group>
				<ADropdownMenu.Divider />
				<ADropdownMenu.Item disabled onclick={() => (lastAction = 'Export')}
					>Export (unavailable)</ADropdownMenu.Item
				>
			</ADropdownMenu.Content>
		</ADropdownMenu.Root>
		<code class="text-muted-foreground text-xs font-mono">action: {lastAction}</code>
	</div>
</Story>

<Story name="Profile Menu">
	<div
		class="bg-background bg-dot-grid flex h-screen w-full flex-col items-center justify-center gap-4"
	>
		<ADropdownMenu.Root bind:open={profileOpen} placement="bottom-end">
			<ADropdownMenu.Trigger
				class="border-border bg-card hover:border-foreground/40 flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition-colors"
			>
				<span
					class="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
				>
					JD
				</span>
				<span class="text-foreground font-medium">Jane Doe</span>
			</ADropdownMenu.Trigger>
			<ADropdownMenu.Content>
				<ADropdownMenu.Item onclick={() => (lastAction = 'Profile')}>Profile</ADropdownMenu.Item>
				<ADropdownMenu.Item onclick={() => (lastAction = 'Settings')}>Settings</ADropdownMenu.Item>
				<ADropdownMenu.Item onclick={() => (lastAction = 'Billing')}>Billing</ADropdownMenu.Item>
				<ADropdownMenu.Divider />
				<ADropdownMenu.Item onclick={() => (lastAction = 'Sign out')}>Sign out</ADropdownMenu.Item>
			</ADropdownMenu.Content>
		</ADropdownMenu.Root>
		<code class="text-muted-foreground text-xs font-mono">action: {lastAction}</code>
	</div>
</Story>
