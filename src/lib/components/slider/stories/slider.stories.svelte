<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { default as SliderCmp } from '../slider.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Slider',
		parameters: { layout: 'centered' },
		args: {
			value: 40,
			min: 0,
			max: 100,
			step: 1,
			disabled: false,
			orientation: 'horizontal'
		},
		argTypes: {
			value: {
				control: { type: 'number', min: 0, max: 100, step: 1 },
				description: 'Current value of the slider'
			},
			min: {
				control: { type: 'number' },
				description: 'Minimum value'
			},
			max: {
				control: { type: 'number' },
				description: 'Maximum value'
			},
			step: {
				control: { type: 'number', min: 1 },
				description: 'Step increment between values'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable interaction with the slider'
			},
			orientation: {
				control: 'select',
				options: ['horizontal', 'vertical'],
				description: 'Layout direction of the slider'
			}
		}
	});
</script>

<script lang="ts">
	let value = $state(40);
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="w-72">
			<SliderCmp {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Controlled">
	<div class="flex w-72 flex-col gap-3">
		<div class="flex items-center justify-between text-sm">
			<span class="font-medium">Volume</span>
			<span class="text-muted-foreground tabular-nums">{value}</span>
		</div>
		<SliderCmp bind:value min={0} max={100} step={1} />
	</div>
</Story>

<Story name="Steps">
	<div class="flex w-72 flex-col gap-6">
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium">Step 1 (default)</span>
			<SliderCmp value={50} min={0} max={100} step={1} />
		</div>
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium">Step 10</span>
			<SliderCmp value={50} min={0} max={100} step={10} />
		</div>
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium">Step 25</span>
			<SliderCmp value={50} min={0} max={100} step={25} />
		</div>
	</div>
</Story>

<Story name="Disabled">
	<div class="flex w-72 flex-col gap-6">
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium">Disabled at 30%</span>
			<SliderCmp value={30} disabled />
		</div>
		<div class="flex flex-col gap-2">
			<span class="text-sm font-medium">Disabled at 70%</span>
			<SliderCmp value={70} disabled />
		</div>
	</div>
</Story>

<Story name="Vertical">
	<div class="flex h-48 gap-8 items-end">
		<div class="flex flex-col items-center gap-2 h-full">
			<span class="text-xs text-muted-foreground font-medium">Bass</span>
			<SliderCmp value={60} orientation="vertical" class="flex-1" />
		</div>
		<div class="flex flex-col items-center gap-2 h-full">
			<span class="text-xs text-muted-foreground font-medium">Mid</span>
			<SliderCmp value={80} orientation="vertical" class="flex-1" />
		</div>
		<div class="flex flex-col items-center gap-2 h-full">
			<span class="text-xs text-muted-foreground font-medium">Treble</span>
			<SliderCmp value={45} orientation="vertical" class="flex-1" />
		</div>
		<div class="flex flex-col items-center gap-2 h-full">
			<span class="text-xs text-muted-foreground font-medium">Vol</span>
			<SliderCmp value={90} orientation="vertical" class="flex-1" />
		</div>
	</div>
</Story>

<Story name="Custom Thumb">
	<div class="flex w-72 flex-col gap-2">
		<span class="text-sm font-medium">Custom thumb snippet</span>
		<SliderCmp value={60}>
			{#snippet thumbContent({ percent })}
				<div
					class="absolute -translate-x-1/2 pointer-events-none bg-primary text-primary-foreground flex h-4 aspect-square p-0 items-center justify-center rounded-full text-[8px] font-bold shadow-sm shadow-black/50"
					style={`left: ${percent}%`}
				>
					{Math.round(percent)}
				</div>
			{/snippet}
		</SliderCmp>
	</div>
</Story>

<Story name="Custom Track">
	<div class="flex w-72 flex-col gap-2">
		<span class="text-sm font-medium">Custom track snippet</span>
		<SliderCmp value={70}>
			{#snippet trackContent({ percent })}
				<div class="bg-muted relative h-3 w-full overflow-hidden rounded-full">
					<div
						class="from-primary to-destructive h-full rounded-full bg-gradient-to-r"
						style="width: {percent}%"
					></div>
				</div>
			{/snippet}
		</SliderCmp>
	</div>
</Story>
