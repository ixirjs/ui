<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Image } from '.';

	const { Story } = defineMeta({
		title: 'Atoms/Image',
		component: Image,
		parameters: { layout: 'centered' },
		args: {
			src: 'https://placehold.co/600x400',
			alt: 'Placeholder image'
		},
		argTypes: {
			src: { control: 'text', description: 'URL of the image to display' },
			alt: { control: 'text', description: 'Accessible alternative text for the image' }
		}
	});
</script>

<script lang="ts">
	const validSrc = 'https://placehold.co/600x400';
	const brokenSrc = 'https://broken.invalid/image.jpg';
	let src = $state(validSrc);

	const isBroken = $derived(src === brokenSrc);
</script>

<!--
	Interactive: the `children` snippet renders ONLY when the <img> fails to load.
	Flip the source to a broken URL and the fallback takes over automatically.
-->
<Story name="Fallback Demo">
	<div class="flex w-150 flex-col gap-3">
		<!-- `{#key src}` remounts on source change so the error state resets cleanly. -->
		{#key src}
			<Image class="h-100 w-full" {src} alt="Toggleable image">
				<div class="text-foreground/50 flex flex-col items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
					<p class="text-sm">Image could not be loaded — fallback shown</p>
				</div>
			</Image>
		{/key}
		<div class="flex items-center justify-between">
			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
				onclick={() => (src = isBroken ? validSrc : brokenSrc)}
			>
				{isBroken ? 'Restore valid source' : 'Break the source'}
			</button>
			<code class="text-muted-foreground text-xs font-mono" class:text-destructive={isBroken}>
				{isBroken ? 'onerror → fallback' : 'loaded'}
			</code>
		</div>
	</div>
</Story>

<Story name="Basic">
	{#snippet template(args)}
		<Image class="h-100 w-150" {...args}>
			<p class="text-sm text-foreground/50">Failed to load image</p>
		</Image>
	{/snippet}
</Story>

<Story name="Error Fallback">
	{#snippet template(args)}
		<Image class="h-100 w-150" src="https://broken.invalid/image.jpg" alt={args.alt}>
			<div class="flex flex-col items-center gap-2 text-foreground/50">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
				<p class="text-sm">Image could not be loaded</p>
			</div>
		</Image>
	{/snippet}
</Story>

<Story name="Square">
	{#snippet template(args)}
		<Image class="size-75" src="https://placehold.co/300x300" alt={args.alt}>
			<p class="text-sm text-foreground/50">Failed to load image</p>
		</Image>
	{/snippet}
</Story>
