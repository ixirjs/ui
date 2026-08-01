<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Dialog as ADialog } from '..';
	import { Button } from '../../button';

	// https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Dialog/Basic',
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
</script>

<!--
	Dialog is controlled: drive it with `bind:open`. `type` decides backdrop behaviour
	("modal" closes on outside click; "non-modal" stays open). For a built-in trigger,
	reach for PopoverDialog instead.
-->
<Story name="Basic" args={{ disabled: false, type: 'modal' }}>
	{#snippet template(args)}
		<div class="flex flex-col items-start gap-3 p-8">
			<Button variant="primary" onclick={() => (isDialogOpen = true)}>Open dialog</Button>
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
						<ADialog.Title>Dialog title</ADialog.Title>
						<ADialog.CloseButton class="ml-auto" />
					</ADialog.Header>

					<ADialog.Body>
						<ADialog.Description>
							A basic dialog with a header, body and footer. Close it from the header button, the
							footer, or — when <code>type</code> is "modal" — by clicking the backdrop.
						</ADialog.Description>
					</ADialog.Body>

					<ADialog.Footer class="gap-2">
						<Button variant="primary" onclick={() => (isDialogOpen = false)}>Done</Button>
					</ADialog.Footer>
				</ADialog.Content>
			</ADialog.Root>
		</div>
	{/snippet}
</Story>
