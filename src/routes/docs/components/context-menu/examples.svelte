<script lang="ts">
	import { Button } from '$lib/components/button';
	import { ContextMenu } from '$lib/components/context-menu';
	import { DataGrid } from '$lib/components/datagrid';
	import { DocExample } from '$docs/components';
	import type { DocMode } from '$docs/context/doc-mode.svelte';

	type Props = {
		contentType: DocMode;
		basicCode: string;
		buttonCode: string;
		rowCode: string;
	};

	let { contentType, basicCode, buttonCode, rowCode }: Props = $props();

	let rows = $state([
		{ id: 1, name: 'Alice Chen', role: 'Engineer' },
		{ id: 2, name: 'Bob Martinez', role: 'Designer' },
		{ id: 3, name: 'Charlie Kim', role: 'Product' }
	]);
</script>

{#if contentType === 'markdown'}
	Includes three examples: - Basic right-click zone - Button as trigger base - DataGrid row-level
	actions
{/if}

{#if contentType === 'html'}
	<DocExample
		title="Basic Zone"
		description="Right-click the zone to open the menu"
		code={basicCode}
	>
		<ContextMenu.Root>
			<ContextMenu.Trigger
				class="flex h-32 w-64 items-center justify-center rounded-lg border border-dashed p-4 text-sm bg-card/50"
			>
				Right-click this area
			</ContextMenu.Trigger>
			<ContextMenu.Content
				preset="context-menu.content"
				class="min-w-44 rounded-lg border bg-popover shadow-md p-0"
			>
				<ContextMenu.Item preset="context-menu.item" class="border-none">Copy</ContextMenu.Item>
				<ContextMenu.Item preset="context-menu.item" class="border-none">Paste</ContextMenu.Item>
				<ContextMenu.Divider />
				<ContextMenu.Item preset="context-menu.item" class="border-none text-destructive"
					>Delete</ContextMenu.Item
				>
			</ContextMenu.Content>
		</ContextMenu.Root>
	</DocExample>

	<DocExample title="On Button" description="Use Button as the trigger base" code={buttonCode}>
		<ContextMenu.Root>
			<ContextMenu.Trigger base={Button} variant="secondary">Right-click button</ContextMenu.Trigger
			>
			<ContextMenu.Content
				preset="context-menu.content"
				class="min-w-44 rounded-lg border bg-popover shadow-md p-0"
			>
				<ContextMenu.Item preset="context-menu.item" class="border-none">Open</ContextMenu.Item>
				<ContextMenu.Item preset="context-menu.item" class="border-none">Rename</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	</DocExample>

	<DocExample title="On DataGrid Row" description="Row-level context actions" code={rowCode}>
		<DataGrid.Root class="w-full rounded-lg border">
			<DataGrid.Header>
				<DataGrid.Row>
					<DataGrid.Column>Name</DataGrid.Column>
					<DataGrid.Column>Role</DataGrid.Column>
				</DataGrid.Row>
			</DataGrid.Header>
			<DataGrid.Body>
				{#each rows as row (row.id)}
					<ContextMenu.Root>
						<ContextMenu.Trigger
							base={DataGrid.Row}
							class="cursor-context-menu px-8 py-0 rounded-none"
						>
							<DataGrid.Cell>{row.name}</DataGrid.Cell>
							<DataGrid.Cell>{row.role}</DataGrid.Cell>
						</ContextMenu.Trigger>
						<ContextMenu.Content
							preset="context-menu.content"
							class="min-w-44 rounded-lg border bg-popover shadow-md p-0"
						>
							<ContextMenu.Item preset="context-menu.item" class="border-none"
								>Edit row</ContextMenu.Item
							>
							<ContextMenu.Item preset="context-menu.item" class="border-none text-destructive"
								>Delete row</ContextMenu.Item
							>
						</ContextMenu.Content>
					</ContextMenu.Root>
				{/each}
			</DataGrid.Body>
		</DataGrid.Root>
	</DocExample>
{/if}
