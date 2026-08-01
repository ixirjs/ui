<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HtmlElement from '$ixirjs/ui/components/element/html-element.svelte';
	import { Button } from '$ixirjs/ui/components/button';
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
				options: [
					'div',
					'section',
					'article',
					'aside',
					'main',
					'p',
					'span',
					'header',
					'footer',
					'nav'
				],
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
	let showBanner = $state(true);
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

<!--
	Real-world: a dismissible notification banner. `HtmlElement` renders the semantic
	<aside> and owns its own enter/exit fly transition, so the banner animates on dismiss.
-->
<Story name="Notification Banner">
	<div class="flex w-80 flex-col gap-4">
		{#if showBanner}
			<HtmlElement
				as="aside"
				enter={(node) => fly(node, { y: -12, duration: 300 })}
				exit={(node) => fly(node, { y: -12, duration: 200 })}
				class="border-border bg-card flex items-start gap-3 rounded-lg border p-4 shadow-sm"
			>
				<span class="text-primary mt-0.5 shrink-0">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="size-5"
					>
						<path d="M10.268 21a2 2 0 0 0 3.464 0" />
						<path
							d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
						/>
					</svg>
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-foreground text-sm font-medium">Deploy finished</p>
					<p class="text-muted-foreground text-sm">Your changes are live in production.</p>
				</div>
				<button
					class="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
					onclick={() => (showBanner = false)}
					aria-label="Dismiss notification"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="size-4"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</HtmlElement>
		{/if}

		<Button onclick={() => (showBanner = !showBanner)}>
			{showBanner ? 'Dismiss' : 'Show'} notification
		</Button>
	</div>
</Story>

<Story name="Polymorphic Tag">
	<div class="flex flex-col gap-3 w-72">
		{#each ['div', 'section', 'article', 'aside', 'nav'] as tag (tag)}
			<HtmlElement
				as={tag}
				class="px-3 py-2 bg-muted rounded text-sm font-mono text-muted-foreground"
			>
				&lt;{tag}&gt; — rendered as a {tag} element
			</HtmlElement>
		{/each}
	</div>
</Story>
