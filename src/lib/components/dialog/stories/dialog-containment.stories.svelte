<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Dialog as ADialog } from '..';
	import { Button } from '../../button';

	// A Portal is a containment scope. The Popover opened inside the
	// Dialog resolves to the Dialog's own Portal, whose container is the Dialog card.
	// floating-ui uses that as its (soft) boundary, so a nested overlay flips/shifts to
	// stay within the Dialog rather than spilling into the viewport. See the
	// "Nested Popover" story for the full sticky-header / z-anchor proof.
	const { Story } = defineMeta({
		title: 'Atoms/Dialog/Containment',
		parameters: { layout: 'fullscreen' },
		args: {
			disabled: false,
			type: 'modal'
		},
		argTypes: {
			disabled: {
				control: 'boolean',
				description: 'Disable interaction (backdrop click will not close)'
			},
			type: {
				control: 'select',
				options: ['modal', 'non-modal'],
				description:
					"'modal' closes on backdrop click (default); 'non-modal' keeps it open on backdrop click"
			}
		}
	});
</script>

<script lang="ts">
	let open = $state(false);
</script>

<Story name="Containment">
	{#snippet template(args)}
		<div class="flex flex-col items-start justify-center p-8">
			<Button variant="primary" onclick={() => (open = true)}>Open Dialog</Button>

			<ADialog.Root class="bg-neutral-900/20" z-index={10} bind:open {...args}>
				<ADialog.Content class="max-w-120">
					<ADialog.Header class="flex items-center">
						<ADialog.Title>Dialog title</ADialog.Title>
						<ADialog.CloseButton class="ml-auto" />
					</ADialog.Header>

					<ADialog.Body>
						<ADialog.Description>
							This is a standard dialog. The backdrop click behaviour is controlled by the
							<strong>type</strong> arg — set it to
							<code>non-modal</code> to keep the dialog open when clicking outside.
						</ADialog.Description>
					</ADialog.Body>

					<ADialog.Footer class="gap-4">
						<Button onclick={() => (open = false)}>Close</Button>
					</ADialog.Footer>
				</ADialog.Content>
			</ADialog.Root>
		</div>
	{/snippet}
</Story>
