<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Tooltip as Tooltip_ } from '..';
	import { Button } from '$ixirjs/ui/components/button';
	import type { Placement } from '@floating-ui/dom';

	const { Story } = defineMeta({
		title: 'Atoms/Tooltip',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			placement: 'top',
			disabled: false,
			offset: 0
		},
		argTypes: {
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
				description: 'Preferred placement of the tooltip relative to its trigger'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable the trigger and prevent the tooltip from opening'
			},
			offset: {
				control: 'number',
				description: 'Distance in pixels between the trigger and the tooltip content'
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="flex h-screen w-full items-center justify-center">
			<Tooltip_.Root {...args}>
				<Tooltip_.Trigger base={Button}>Hover me</Tooltip_.Trigger>
				<Tooltip_.Content>
					This is a tooltip
					<Tooltip_.Tail />
				</Tooltip_.Content>
			</Tooltip_.Root>
		</div>
	{/snippet}
</Story>

<Story name="Placements">
	<div class="flex h-screen w-full flex-col items-center justify-center gap-10">
		<p class="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.25em]">
			Tooltip Placements
		</p>

		<div class="grid grid-cols-3 place-items-center gap-6">
			{#each [['top-start', 'Top Start'], ['top', 'Top'], ['top-end', 'Top End'], ['left', 'Left'], ['', ''], ['right', 'Right'], ['bottom-start', 'Bottom Start'], ['bottom', 'Bottom'], ['bottom-end', 'Bottom End']] as [placement, label] (label || 'center')}
				{#if placement}
					<Tooltip_.Root placement={placement as Placement} offset={0} open={true}>
						<Tooltip_.Trigger base={Button} class="w-32 text-xs">
							{label}
						</Tooltip_.Trigger>
						<Tooltip_.Content class="rounded-xl">
							{label}
							<Tooltip_.Tail />
						</Tooltip_.Content>
					</Tooltip_.Root>
				{:else}
					<div></div>
				{/if}
			{/each}
		</div>
	</div>
</Story>

<Story name="With Rich Content">
	<div class="flex h-screen w-full flex-col items-center justify-center gap-8">
		<p class="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.25em]">
			Rich Tooltip Content
		</p>

		<div class="flex items-center gap-6">
			<!-- Icon button with descriptive tooltip -->
			<Tooltip_.Root placement="top" offset={0}>
				<Tooltip_.Trigger
					class="border-border/70 hover:border-foreground/40 inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-colors"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4"
					>
						<circle cx="12" cy="12" r="3"></circle>
						<path
							d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
						></path>
					</svg>
				</Tooltip_.Trigger>
				<Tooltip_.Content class="w-48 px-3 py-2">
					<p class="font-semibold leading-snug">Settings</p>
					<p class="text-background/70 mt-0.5 leading-snug">Configure your workspace preferences</p>
					<Tooltip_.Tail />
				</Tooltip_.Content>
			</Tooltip_.Root>

			<!-- Keyboard shortcut tooltip -->
			<Tooltip_.Root placement="top" offset={0}>
				<Tooltip_.Trigger base={Button}>Save</Tooltip_.Trigger>
				<Tooltip_.Content class="flex items-center gap-2">
					Save document
					<kbd class="bg-background/20 rounded px-1 py-0.5 font-mono text-[10px]">⌘S</kbd>
					<Tooltip_.Tail />
				</Tooltip_.Content>
			</Tooltip_.Root>

			<!-- Status indicator tooltip -->
			<Tooltip_.Root placement="top" offset={0}>
				<Tooltip_.Trigger
					class="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
					Online
				</Tooltip_.Trigger>
				<Tooltip_.Content>
					All systems operational
					<Tooltip_.Tail />
				</Tooltip_.Content>
			</Tooltip_.Root>
		</div>
	</div>
</Story>

<Story name="Disabled">
	<div class="flex h-screen w-full items-center justify-center gap-8">
		<Tooltip_.Root placement="top" offset={0}>
			<Tooltip_.Trigger base={Button}>Enabled trigger</Tooltip_.Trigger>
			<Tooltip_.Content>
				Tooltip is active
				<Tooltip_.Tail />
			</Tooltip_.Content>
		</Tooltip_.Root>

		<Tooltip_.Root placement="top" disabled offset={0}>
			<Tooltip_.Trigger base={Button} disabled>Disabled trigger</Tooltip_.Trigger>
			<Tooltip_.Content>
				This will not show
				<Tooltip_.Tail />
			</Tooltip_.Content>
		</Tooltip_.Root>
	</div>
</Story>
