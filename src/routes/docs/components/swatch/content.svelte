<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocCallout } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { swatchProps } from './props';
	import { metadata } from './shared';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const frontmatter: Frontmatter = {
		id: 'swatch',
		title: 'Swatch',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: ['input']
	};

	const apiSections: PropsSection[] = [
		{ label: 'Swatch', presetKey: 'swatch', props: swatchProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {frontmatter} {apiSections}>
	{#snippet installationNote()}
		<DocCallout variant="info" title="Used inside Input">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href="/docs/components/input"
				class="text-foreground underline underline-offset-4 hover:no-underline">Input.ColorSwatch</a
			>
			is a bond-connected wrapper around this standalone
			<code class="bg-muted rounded px-1.5 py-0.5 text-xs">Swatch</code>. When placed inside
			<code class="bg-muted rounded px-1.5 py-0.5 text-xs">Input.Root</code>
			next to
			<code class="bg-muted rounded px-1.5 py-0.5 text-xs">Input.ColorControl</code>, it reads the
			current color from the bond automatically — no
			<code class="bg-muted rounded px-1.5 py-0.5 text-xs">color</code> prop needed.
		</DocCallout>
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic"
			description="Pass any valid CSS color string."
			{...ex('./examples/basic.svelte')}
		/>

		<DocExample
			title="Transparent & Empty"
			description="Checkerboard pattern shows when color is transparent or empty."
			{...ex('./examples/transparent.svelte')}
		/>

		<DocExample
			title="Sizes"
			description="Control size via Tailwind classes."
			{...ex('./examples/sizes.svelte')}
		/>

		<DocExample
			title="Radius"
			description="Any border-radius works — square, rounded, or circle."
			{...ex('./examples/radius.svelte')}
		/>

		<DocExample
			title="With ColorControl"
			description="Input.ColorSwatch sits inside Input.Root and reads the color value from the bond — no prop needed."
			{...ex('./examples/color-control.svelte')}
		/>
	{/snippet}
</DocComponentPage>
