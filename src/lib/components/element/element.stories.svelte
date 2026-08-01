<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HtmlElement from './html-element.svelte';
	import { Button } from '../button';
	import { fade, fly, scale } from 'svelte/transition';

	const { Story } = defineMeta({
		title: 'Atoms/Element',
		parameters: {
			layout: 'centered'
		},
		args: {
			as: 'div',
			global: true
		},
		argTypes: {
			as: {
				control: 'select',
				options: ['div', 'section', 'article', 'aside', 'main', 'p', 'span', 'header', 'footer', 'nav'],
				description: 'The HTML tag to render as (polymorphic)'
			},
			global: {
				control: 'boolean',
				description: 'Emit transitions as :global rather than scoped'
			}
		}
	});
</script>

<script lang="ts">
	let showFade = $state(true);
	let showFly = $state(true);
	let showScale = $state(true);
</script>

<Story name="Basic">
	{#snippet template(args)}
		<HtmlElement {...args} class="p-4 bg-blue-100 rounded text-sm text-blue-800">
			I render as a <strong>&lt;{args.as ?? 'div'}&gt;</strong> element. Toggle the
			<em>as</em> control to change the underlying HTML tag.
		</HtmlElement>
	{/snippet}
</Story>

<Story name="Fade Transition">
	<div class="flex flex-col gap-4 w-72">
		{#if showFade}
			<HtmlElement
				enter={(node) => fade(node, { duration: 400 })}
				exit={(node) => fade(node, { duration: 400 })}
				class="p-4 bg-blue-100 rounded text-sm text-blue-800"
				as="section"
			>
				This element fades in and out using the <strong>enter</strong> and
				<strong>exit</strong> transition props.
			</HtmlElement>
		{/if}

		<Button onclick={() => (showFade = !showFade)}>
			{showFade ? 'Hide' : 'Show'} element
		</Button>
	</div>
</Story>

<Story name="Fly Transition">
	<div class="flex flex-col gap-4 w-72">
		{#if showFly}
			<HtmlElement
				enter={(node) => fly(node, { y: -16, duration: 350 })}
				exit={(node) => fly(node, { y: 16, duration: 350 })}
				class="p-4 bg-purple-100 rounded text-sm text-purple-800"
				as="article"
			>
				This element flies in from above and exits downward.
			</HtmlElement>
		{/if}

		<Button onclick={() => (showFly = !showFly)}>
			{showFly ? 'Hide' : 'Show'} element
		</Button>
	</div>
</Story>

<Story name="Scale Transition">
	<div class="flex flex-col gap-4 w-72">
		{#if showScale}
			<HtmlElement
				enter={(node) => scale(node, { duration: 300, start: 0.85 })}
				exit={(node) => scale(node, { duration: 300, start: 0.85 })}
				class="p-4 bg-emerald-100 rounded text-sm text-emerald-800"
				as="div"
			>
				This element scales in and out smoothly.
			</HtmlElement>
		{/if}

		<Button onclick={() => (showScale = !showScale)}>
			{showScale ? 'Hide' : 'Show'} element
		</Button>
	</div>
</Story>

<Story name="Polymorphic Tag">
	<div class="flex flex-col gap-3 w-72">
		{#each ['div', 'section', 'article', 'aside', 'nav'] as tag}
			<HtmlElement
				as={tag}
				class="px-3 py-2 bg-muted rounded text-sm font-mono text-muted-foreground"
			>
				&lt;{tag}&gt; — rendered as a {tag} element
			</HtmlElement>
		{/each}
	</div>
</Story>
