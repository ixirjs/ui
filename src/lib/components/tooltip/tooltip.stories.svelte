<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Tooltip as Tooltip_ } from '.';
	import { Button } from '$svelte-atoms/core/components/button';
	import type { Placement } from '@floating-ui/dom';

	const { Story } = defineMeta({
		title: 'Atoms/Tooltip',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			placement: 'top',
			disabled: false,
			offset: 6
		},
		argTypes: {
			placement: {
				control: 'select',
				options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'],
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
		<div class="bg-background bg-dot-grid flex h-screen w-full items-center justify-center">
			<Tooltip_.Root {...args}>
				<Tooltip_.Trigger base={Button}>Hover me</Tooltip_.Trigger>
				<Tooltip_.Content class="bg-foreground text-background rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm">
					This is a tooltip
					<Tooltip_.Arrow />
				</Tooltip_.Content>
			</Tooltip_.Root>
		</div>
	{/snippet}
</Story>

<Story name="Placements">
	<div class="bg-background bg-dot-grid flex h-screen w-full flex-col items-center justify-center gap-10">
		<p class="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.25em]">Tooltip Placements</p>

		<div class="grid grid-cols-3 place-items-center gap-6">
			{#each [
				['top-start', 'Top Start'],
				['top', 'Top'],
				['top-end', 'Top End'],
				['left', 'Left'],
				['', ''],
				['right', 'Right'],
				['bottom-start', 'Bottom Start'],
				['bottom', 'Bottom'],
				['bottom-end', 'Bottom End']
			] as [placement, label] (label || 'center')}
				{#if placement}
					<Tooltip_.Root placement={placement as Placement} offset={8}>
						<Tooltip_.Trigger base={Button} class="w-32 text-xs">
							{label}
						</Tooltip_.Trigger>
						<Tooltip_.Content class="bg-foreground text-background rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm">
							{label}
							<Tooltip_.Arrow />
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
	<div class="bg-background bg-dot-grid flex h-screen w-full flex-col items-center justify-center gap-8">
		<p class="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.25em]">Rich Tooltip Content</p>

		<div class="flex items-center gap-6">
			<!-- Icon button with descriptive tooltip -->
			<Tooltip_.Root placement="top" offset={8}>
				<Tooltip_.Trigger
					class="border-border/70 hover:border-foreground/40 inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-colors"
				>
					⚙
				</Tooltip_.Trigger>
				<Tooltip_.Content class="bg-foreground text-background w-48 rounded-md px-3 py-2 text-xs shadow-sm">
					<p class="font-semibold leading-snug">Settings</p>
					<p class="text-background/70 mt-0.5 leading-snug">Configure your workspace preferences</p>
					<Tooltip_.Arrow />
				</Tooltip_.Content>
			</Tooltip_.Root>

			<!-- Keyboard shortcut tooltip -->
			<Tooltip_.Root placement="top" offset={8}>
				<Tooltip_.Trigger base={Button}>
					Save
				</Tooltip_.Trigger>
				<Tooltip_.Content class="bg-foreground text-background flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm">
					Save document
					<kbd class="bg-background/20 rounded px-1 py-0.5 font-mono text-[10px]">⌘S</kbd>
					<Tooltip_.Arrow />
				</Tooltip_.Content>
			</Tooltip_.Root>

			<!-- Status indicator tooltip -->
			<Tooltip_.Root placement="top" offset={8}>
				<Tooltip_.Trigger
					class="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
					Online
				</Tooltip_.Trigger>
				<Tooltip_.Content class="bg-foreground text-background rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm">
					All systems operational
					<Tooltip_.Arrow />
				</Tooltip_.Content>
			</Tooltip_.Root>
		</div>
	</div>
</Story>

<Story name="Disabled">
	<div class="bg-background bg-dot-grid flex h-screen w-full items-center justify-center gap-8">
		<Tooltip_.Root placement="top" offset={8}>
			<Tooltip_.Trigger base={Button}>Enabled trigger</Tooltip_.Trigger>
			<Tooltip_.Content class="bg-foreground text-background rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm">
				Tooltip is active
				<Tooltip_.Arrow />
			</Tooltip_.Content>
		</Tooltip_.Root>

		<Tooltip_.Root placement="top" offset={8} disabled>
			<Tooltip_.Trigger base={Button} disabled>Disabled trigger</Tooltip_.Trigger>
			<Tooltip_.Content class="bg-foreground text-background rounded-md px-2.5 py-1.5 text-xs font-medium shadow-sm">
				This will not show
				<Tooltip_.Arrow />
			</Tooltip_.Content>
		</Tooltip_.Root>
	</div>
</Story>
