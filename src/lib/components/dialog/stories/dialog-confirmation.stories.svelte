<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Dialog as ADialog } from '..';
	import { Button } from '../../button';

	// https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Dialog/Confirmation',
		parameters: {
			// https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen'
		}
	});
</script>

<script lang="ts">
	let confirmOpen = $state(false);
	let lastAction = $state('—');
</script>

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
