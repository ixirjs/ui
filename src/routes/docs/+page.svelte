<script lang="ts">
	import { Section, CodeBlock } from '$docs/components';
	import { Badge } from '$lib/components/badge';
	import { Button } from '$lib/components/button';
	type FeatureKey = 'atoms' | 'bonds' | 'preset' | 'typescript' | 'aria' | 'runes';

	const features: Array<{ title: string; description: string; href: string; iconKey: FeatureKey }> =
		[
			{
				title: 'Atoms',
				description:
					'Atom Components render flexible parts; Atoms provide runtime spreads, element refs, and local capabilities.',
				href: '/docs/atoms',
				iconKey: 'atoms'
			},
			{
				title: 'Bonds',
				description:
					'Shared state, context, registered Atoms, and compound coordination without prop drilling.',
				href: '/docs/bonds',
				iconKey: 'bonds'
			},
			{
				title: 'Preset System',
				description:
					'One setPreset() call defines your entire design system. Override globally or per-instance without specificity battles.',
				href: '/docs/preset',
				iconKey: 'preset'
			},
			{
				title: 'TypeScript',
				description:
					'Full type inference for variants, Atoms, capabilities, and Bond props. Catch mistakes at author time.',
				href: '/docs/quick-start',
				iconKey: 'typescript'
			},
			{
				title: 'WAI-ARIA',
				description:
					'Keyboard navigation, focus management, and ARIA roles are built into every component by default — not bolted on.',
				href: '/docs/accessibility',
				iconKey: 'aria'
			},
			{
				title: 'Svelte 5 Runes',
				description:
					"Purpose-built for $state, $derived, and $effect. Embraces Svelte 5's reactive model rather than working around it.",
				href: '/docs/philosophy',
				iconKey: 'runes'
			}
		];

	const quickLinks = [
		{
			title: 'Quick Start',
			description: 'Install and build your first component in minutes.',
			href: '/docs/quick-start',
			badge: 'Start here'
		},
		{
			title: 'Components',
			description: 'Browse 30+ accessible, headless components.',
			href: '/docs/components/button',
			badge: '30+'
		},
		{
			title: 'Philosophy',
			description: 'Understand Atoms, Bonds, capabilities, and presets.',
			href: '/docs/philosophy',
			badge: 'Concepts'
		},
		{
			title: 'Styling',
			description: 'Own every pixel via the Preset system.',
			href: '/docs/styling',
			badge: 'Guide'
		},
		{
			title: 'Migration',
			description: 'Move older BondState and Bond-owned Atom code to the current model.',
			href: '/docs/migration',
			badge: 'Guide'
		}
	];

	const steps = [
		{
			n: '1',
			title: 'Install the package',
			lang: 'bash' as const,
			code: 'bun add @ixirjs/ui'
		},
		{
			n: '2',
			title: 'Import styles in your layout',
			lang: 'typescript' as const,
			code: "// +layout.svelte\nimport '@ixirjs/ui/styles/root.css';"
		},
		{
			n: '3',
			title: 'Import and use components',
			lang: 'svelte' as const,
			code:
				"<script>\n  import { Button } from '@ixirjs/ui/components/button';\n<" +
				'/script>\n\n<Button>Click me</Button>'
		}
	];
</script>

{#snippet featureIcon(key: FeatureKey)}
	{#if key === 'atoms'}
		<circle cx="12" cy="12" r="1" /><circle cx="12" cy="12" r="7" /><circle
			cx="12"
			cy="12"
			r="11"
		/>
	{:else if key === 'bonds'}
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path
			d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
		/>
	{:else if key === 'preset'}
		<path
			d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
		/><circle cx="12" cy="12" r="3" />
	{:else if key === 'typescript'}
		<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
	{:else if key === 'aria'}
		<circle cx="12" cy="12" r="10" /><path d="M12 8h.01" /><path d="M11 12h1v4h1" />
	{:else if key === 'runes'}
		<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
	{/if}
{/snippet}

<svelte:head>
	<title>Documentation — Svelte Atoms</title>
	<meta
		name="description"
		content="Complete documentation for Svelte Atoms — a headless, composable Svelte 5 component library built on Atoms, Bonds, and the Preset system."
	/>
</svelte:head>

<!-- Hero -->
<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Documentation</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">Everything you need.</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		From installation to advanced architecture — all the docs for building with Svelte Atoms.
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/quick-start" as="a" variant="primary" class="gap-2 px-5">
			Get started
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
			</svg>
		</Button>
		<Button href="/docs/components/button" as="a" variant="outline" class="px-5">
			Browse components
		</Button>
	</div>
</div>

<!-- Quick Links -->
<Section.Root>
	<Section.Header>
		<Section.Title>Jump to</Section.Title>
	</Section.Header>
	<div class="grid gap-3 sm:grid-cols-2">
		{#each quickLinks as link (link.href)}
			<a
				href={link.href}
				class="group border-border hover:border-primary/50 hover:bg-muted/30 flex items-center justify-between gap-4 rounded-lg border p-4 transition-all"
			>
				<div class="min-w-0">
					<div class="mb-1 flex items-center gap-2">
						<span class="text-foreground text-sm font-semibold">{link.title}</span>
						<Badge variant="secondary" class="text-xs">{link.badge}</Badge>
					</div>
					<p class="text-muted-foreground text-sm">{link.description}</p>
				</div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-muted-foreground/50 group-hover:text-primary shrink-0 -translate-x-1 transition-all group-hover:translate-x-0"
					aria-hidden="true"
				>
					<path d="m9 18 6-6-6-6" />
				</svg>
			</a>
		{/each}
	</div>
</Section.Root>

<!-- Core Concepts -->
<Section.Root>
	<Section.Header>
		<Section.Title>Core concepts</Section.Title>
		<Section.Subtitle
			>Atoms, Bonds, capabilities, and presets give you control over behavior, state, and style</Section.Subtitle
		>
	</Section.Header>
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each features as feature (feature.href)}
			<a
				href={feature.href}
				class="group border-border hover:border-primary/40 bg-card block rounded-lg border p-5 transition-all"
			>
				<div
					class="bg-primary/10 text-primary mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						{@render featureIcon(feature.iconKey)}
					</svg>
				</div>
				<h3
					class="text-foreground group-hover:text-primary mb-1.5 text-sm font-semibold transition-colors"
				>
					{feature.title}
				</h3>
				<p class="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
			</a>
		{/each}
	</div>
</Section.Root>

<!-- Getting Started -->
<Section.Root>
	<Section.Header>
		<Section.Title>Getting started</Section.Title>
		<Section.Subtitle>Up and running in three steps</Section.Subtitle>
	</Section.Header>

	<div class="border-border divide-border divide-y rounded-lg border">
		{#each steps as step, i (step.n)}
			<div class="flex gap-5 p-5">
				<div class="flex flex-col items-center pt-0.5">
					<span
						class="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
					>
						{step.n}
					</span>
					{#if i < steps.length - 1}
						<div class="bg-border mt-2 w-px flex-1"></div>
					{/if}
				</div>
				<div class="min-w-0 flex-1 pb-1">
					<p class="text-foreground mb-3 text-sm font-semibold">{step.title}</p>
					<div class="overflow-hidden rounded-md">
						<CodeBlock lang={step.lang} code={step.code} />
					</div>
				</div>
			</div>
		{/each}
	</div>

	<p class="mt-4 text-sm">
		<a href="/docs/quick-start" class="text-primary font-medium hover:underline">
			Full setup guide — Tailwind config, preset customization, and more →
		</a>
	</p>
</Section.Root>

<!-- Explore Further -->
<Section.Root class="mb-0">
	<div class="border-primary/30 bg-primary/5 rounded-lg border p-6">
		<p class="text-primary mb-2 text-xs font-medium uppercase tracking-wide">Next steps</p>
		<h2 class="text-foreground mb-1.5 text-lg font-semibold">Ready to go deeper?</h2>
		<p class="text-muted-foreground mb-5 text-sm leading-relaxed">
			Learn the architecture, use the styling system, and understand what makes Svelte Atoms
			different from other component libraries.
		</p>
		<div class="flex flex-wrap gap-2">
			<Button href="/docs/philosophy" as="a" variant="primary">Learn the Philosophy</Button>
			<Button href="/docs/atoms" as="a" variant="outline">Understand Atoms</Button>
			<Button href="/docs/bonds" as="a" variant="outline">Understand Bonds</Button>
			<Button href="/docs/migration" as="a" variant="outline">Migration Guide</Button>
			<Button href="/docs/preset" as="a" variant="outline">Explore Presets</Button>
		</div>
	</div>
</Section.Root>
