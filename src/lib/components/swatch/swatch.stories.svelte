<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Swatch } from '.';

	const { Story } = defineMeta({
		title: 'Atoms/Swatch',
		parameters: { layout: 'centered' },
		args: {
			color: 'oklch(0.65 0.18 253)',
		},
		argTypes: {
			color: {
				control: 'text',
				description:
					'Any valid CSS color value — named, hex, rgb(), hsl(), oklch(), color(), transparent, or empty string to show the checkerboard placeholder.',
			},
		},
	});
</script>

<!-- Configurable default -->
<Story name="Basic">
	{#snippet template(args)}
		<Swatch {...args} class="size-10 rounded-md" />
	{/snippet}
</Story>

<!-- Basic colors -->
<Story name="Basic Colors">
	<div class="flex flex-wrap gap-3 p-4">
		{#each [
			{ label: 'Red',             color: 'red' },
			{ label: 'Cornflower blue', color: 'cornflowerblue' },
			{ label: 'Rebecca purple',  color: 'rebeccapurple' },
			{ label: 'Hex',             color: '#1a2b3c' },
			{ label: 'RGB',             color: 'rgb(26, 43, 60)' },
			{ label: 'HSL',             color: 'hsl(210deg 40% 50%)' },
			{ label: 'OKLCH',           color: 'oklch(0.65 0.18 253)' },
			{ label: 'display-p3',      color: 'color(display-p3 0.1 0.4 0.8)' },
		] as item (item.label)}
			<div class="flex flex-col items-center gap-1.5">
				<Swatch color={item.color} class="size-10 rounded-md" />
				<span class="text-muted-foreground text-xs">{item.label}</span>
			</div>
		{/each}
	</div>
</Story>

<!-- Sizes -->
<Story name="Sizes">
	<div class="flex flex-wrap items-end gap-4 p-4">
		{#each [
			{ label: 'xs',  cls: 'size-4 rounded-sm' },
			{ label: 'sm',  cls: 'size-6 rounded-sm' },
			{ label: 'md',  cls: 'size-8 rounded-md' },
			{ label: 'lg',  cls: 'size-10 rounded-md' },
			{ label: 'xl',  cls: 'size-14 rounded-lg' },
			{ label: '2xl', cls: 'size-20 rounded-xl' },
		] as item (item.label)}
			<div class="flex flex-col items-center gap-1.5">
				<Swatch color="oklch(0.65 0.18 253)" class={item.cls} />
				<span class="text-muted-foreground text-xs">{item.label}</span>
			</div>
		{/each}
	</div>
</Story>

<!-- Radius variants -->
<Story name="Radius">
	<div class="flex flex-wrap items-center gap-4 p-4">
		{#each [
			{ label: 'none',    cls: 'size-10 rounded-none' },
			{ label: 'sm',      cls: 'size-10 rounded-sm' },
			{ label: 'md',      cls: 'size-10 rounded-md' },
			{ label: 'lg',      cls: 'size-10 rounded-lg' },
			{ label: 'xl',      cls: 'size-10 rounded-xl' },
			{ label: '2xl',     cls: 'size-10 rounded-2xl' },
			{ label: 'full',    cls: 'size-10 rounded-full' },
		] as item (item.label)}
			<div class="flex flex-col items-center gap-1.5">
				<Swatch color="oklch(0.65 0.18 253)" class={item.cls} />
				<span class="text-muted-foreground text-xs">{item.label}</span>
			</div>
		{/each}
	</div>
</Story>

<!-- Alpha / transparency -->
<Story name="Alpha">
	<div class="flex flex-wrap items-end gap-4 p-4">
		{#each [
			{ label: '100%',  color: 'oklch(0.65 0.18 253)' },
			{ label: '75%',   color: 'oklch(0.65 0.18 253 / 0.75)' },
			{ label: '50%',   color: 'oklch(0.65 0.18 253 / 0.5)' },
			{ label: '25%',   color: 'oklch(0.65 0.18 253 / 0.25)' },
			{ label: 'transparent', color: 'transparent' },
			{ label: 'empty', color: '' },
		] as item (item.label)}
			<div class="flex flex-col items-center gap-1.5">
				<Swatch color={item.color} class="size-10 rounded-md" />
				<span class="text-muted-foreground text-xs">{item.label}</span>
			</div>
		{/each}
	</div>
</Story>
