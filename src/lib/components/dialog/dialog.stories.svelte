<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Dialog as ADialog } from '.';
	import { Select } from '$svelte-atoms/core/components/select';
	import { Button } from '../button';

	// https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Dialog',
		parameters: {
			// https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen'
		},
		args: {
			disabled: false,
			type: 'modal'
		},
		argTypes: {
			disabled: {
				control: 'boolean',
				description: 'Prevent the dialog from being closed by user interaction'
			},
			type: {
				control: 'select',
				options: ['modal', 'non-modal'],
				description:
					'"modal" closes on backdrop click (default); "non-modal" keeps it open when clicking outside'
			}
		}
	});
</script>

<script lang="ts">
	let isDialogOpen = $state(false);
	let language = $state<string>();
	let confirmOpen = $state(false);
	let lastAction = $state('—');
</script>

<!--
	Dialog is controlled: drive it with `bind:open`. `type` decides backdrop behaviour
	("modal" closes on outside click; "non-modal" stays open). For a built-in trigger,
	reach for PopoverDialog instead.
-->
<Story name="Basic" args={{ disabled: false, type: 'modal' }}>
	{#snippet template(args)}
		<div class="flex flex-col items-start gap-3 p-8">
			<Button variant="primary" onclick={() => (isDialogOpen = true)}>Edit preferences</Button>
			<code class="text-muted-foreground text-xs font-mono">bind:open → {isDialogOpen}</code>

			<ADialog.Root
				class="bg-neutral-900/40"
				z-index={10}
				bind:open={isDialogOpen}
				disabled={args.disabled}
				type={args.type}
			>
				<ADialog.Content>
					<ADialog.Header>
						<h2 class="text-base font-semibold">Preferences</h2>
						<ADialog.CloseButton class="ml-auto" />
					</ADialog.Header>

					<ADialog.Body class="flex flex-col gap-4">
						<p class="text-muted-foreground text-sm">
							Choose your interface language. Changes apply immediately and overlays nested inside a
							dialog (like this select) stay correctly stacked.
						</p>

						<div class="flex flex-col gap-1.5">
							<span class="text-sm font-medium">Language</span>
							<Select.Root keys={['ar', 'en', 'sp', 'it']} bind:value={language}>
								<Select.Trigger
									class="border-border hover:border-foreground/30 flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm"
								>
									{language ?? 'Select a language…'}
								</Select.Trigger>
								<Select.List class="border-border bg-popover rounded-md border shadow-lg">
									<Select.Item value="ar" class="cursor-pointer px-3 py-2 text-sm hover:bg-foreground/5">Arabic</Select.Item>
									<Select.Item value="en" class="cursor-pointer px-3 py-2 text-sm hover:bg-foreground/5">English</Select.Item>
									<Select.Item value="sp" class="cursor-pointer px-3 py-2 text-sm hover:bg-foreground/5">Spanish</Select.Item>
									<Select.Item value="it" class="cursor-pointer px-3 py-2 text-sm hover:bg-foreground/5">Italian</Select.Item>
								</Select.List>
							</Select.Root>
						</div>
					</ADialog.Body>

					<ADialog.Footer>
						<Button variant="outline" onclick={() => (isDialogOpen = false)}>Cancel</Button>
						<Button variant="primary" onclick={() => (isDialogOpen = false)}>Save</Button>
					</ADialog.Footer>
				</ADialog.Content>
			</ADialog.Root>
		</div>
	{/snippet}
</Story>

<!-- Confirmation: a focused destructive-action pattern with a status readout. -->
<Story name="Confirmation">
	<div class="flex flex-col items-start gap-3 p-8">
		<Button variant="destructive" onclick={() => (confirmOpen = true)}>Delete account</Button>
		<code class="text-muted-foreground text-xs font-mono">last action: {lastAction}</code>

		<ADialog.Root class="bg-neutral-900/40" z-index={10} bind:open={confirmOpen} type="modal">
			<ADialog.Content>
				<ADialog.Header>
					<h2 class="text-base font-semibold">Delete account?</h2>
					<ADialog.CloseButton class="ml-auto" />
				</ADialog.Header>
				<ADialog.Body>
					<p class="text-muted-foreground text-sm">
						This permanently removes your account and all associated data. This action cannot be
						undone.
					</p>
				</ADialog.Body>
				<ADialog.Footer class="flex justify-end gap-2">
					<Button
						variant="outline"
						onclick={() => {
							lastAction = 'cancelled';
							confirmOpen = false;
						}}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onclick={() => {
							lastAction = 'deleted';
							confirmOpen = false;
						}}
					>
						Delete
					</Button>
				</ADialog.Footer>
			</ADialog.Content>
		</ADialog.Root>
	</div>
</Story>
