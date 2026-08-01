<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Dialog as ADialog } from '.';
	import { Select } from '$svelte-atoms/core/components/select';
	import { Button } from '../button';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Dialog',
		// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs

		parameters: {
			// More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen'
		},
		args: {}
	});
</script>

<script lang="ts">
	let isDialogOpen = $state(false);
	let isSelectOpen = $state(false);
</script>

<Story name="Dialog" args={{}}>	
	<div class="flex flex-col justify-center items-start">
		<!-- Dialog is controlled (open prop); for a built-in trigger use PopoverDialog. -->
		<Button variant="primary" onclick={() => (isDialogOpen = true)}>Open Dialog</Button>
		<ADialog.Root class="bg-neutral-900/20" z-index={10} bind:open={isDialogOpen}>
			<ADialog.Content>
				<ADialog.Header>
					<div>Open Popover</div>
					<ADialog.CloseButton class="ml-auto"></ADialog.CloseButton>
				</ADialog.Header>
	
				<ADialog.Body>
					<p>
						Mauris et habitasse cubilia potenti at condimentum iaculis nam. Ante fusce litora
						tristique letius libero. Curabitur vitae cursus consectetur feugiat aenean viverra vel
						dolor diam nascetur.
					</p>
	
					<Select.Root open={isSelectOpen} class="w-full">
						<Select.Trigger>Hello World</Select.Trigger>
						<Select.List>
							<Select.Item value="ar">Arabic</Select.Item>
							<Select.Item value="en">English</Select.Item>
							<Select.Item value="sp">Spanish</Select.Item>
							<Select.Item value="it">Italian</Select.Item>
						</Select.List>
					</Select.Root>
				</ADialog.Body>
	
				<ADialog.Footer class="gap-4">
					<button onclick={() => (isDialogOpen = false)}>Cancel</button>
					<button>Save</button>
				</ADialog.Footer>
			</ADialog.Content>
		</ADialog.Root>
	</div>
</Story>
