<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { PopoverDialog } from '.';
	import { Button } from '../button';

	// PopoverDialog is the first Fusion (§9.4.1): fuse(Popover, Dialog). Popover's
	// trigger/disclosure opens Dialog's modal content (centered, backdrop, focus-trapped).
	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/PopoverDialog',
		// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs

		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen'
		},
		args: {}
	});
</script>

<script lang="ts">
	let open = $state(false);
</script>

<!--
	The fusion in action: one `<PopoverDialog.Root>` carries Popover's trigger AND
	Dialog's modal presentation. Every part here is a *reused* component — the Trigger
	is `<Popover.Trigger>`, the Header/Body are `<Dialog.*>` — resolving the fused bond
	via context. Root provides context; Content self-portals the backdrop + card.
-->
<Story name="PopoverDialog" args={{}}>
	<div class="flex flex-col items-start justify-center p-8">
		<PopoverDialog.Root bind:open>
			<!-- Reused <Popover.Trigger>: click toggles open, ARIA = dialog. -->
			<PopoverDialog.Trigger base={Button} variant="primary">Open Dialog</PopoverDialog.Trigger>

			<!-- Content self-portals the modal; Header/Body are reused <Dialog.*> atoms. -->
			<PopoverDialog.Content>
				<PopoverDialog.Header>Modal title</PopoverDialog.Header>
				<PopoverDialog.Body>
					<p>
						This panel is opened by a Popover trigger but presented in Dialog (modal) style —
						centered, backdropped, and focus-trapped. It is a single fused bond, and these atoms
						are the very same Popover/Dialog components, reused.
					</p>
				</PopoverDialog.Body>
				<div class="flex justify-end gap-4 px-8 pt-2">
					<Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
					<Button variant="primary" onclick={() => (open = false)}>Confirm</Button>
				</div>
			</PopoverDialog.Content>
		</PopoverDialog.Root>
	</div>
</Story>
