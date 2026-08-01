<script lang="ts">
	import { Section, CodeBlock } from '$docs/components';
	import { Button } from '$lib/components/button';
	import { metadata } from './shared';
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
</svelte:head>

{#snippet conceptIcon(icon: string)}
	{#if icon === 'circle'}
		<circle cx="12" cy="12" r="1" /><circle cx="12" cy="12" r="7" /><circle
			cx="12"
			cy="12"
			r="11"
		/>
	{:else if icon === 'grid'}
		<rect width="7" height="7" x="3" y="3" rx="1" /><rect
			width="7"
			height="7"
			x="14"
			y="3"
			rx="1"
		/>
		<rect width="7" height="7" x="14" y="14" rx="1" /><rect
			width="7"
			height="7"
			x="3"
			y="14"
			rx="1"
		/>
	{:else if icon === 'layers'}
		<path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" />
	{/if}
{/snippet}

<!-- Hero -->
<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Atoms</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">The primitive layer.</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		{metadata.pageDescription}
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/components/atom" as="a" variant="primary" class="gap-2 px-5">
			HtmlAtom reference
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
		<Button href="/docs/bonds" as="a" variant="outline" class="px-5">Understand Bonds</Button>
	</div>
</div>

<!-- What Are Atoms -->
<Section.Root>
	<Section.Header>
		<Section.Title>What are Atoms?</Section.Title>
		<Section.Subtitle>
			The fundamental components that power every higher-level piece in the library.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-3">
		{#each metadata.whatAreAtoms as paragraph, i (i)}
			<p class="text-muted-foreground leading-relaxed">{paragraph}</p>
		{/each}
	</div>
</Section.Root>

<!-- Atom UI vs Atom Class -->
<Section.Root>
	<Section.Header>
		<Section.Title>Atom UI vs Atom class</Section.Title>
		<Section.Subtitle>
			The docs use "atom" in two related ways. Keep these roles separate when reading examples.
		</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-4 md:grid-cols-3">
		{#each metadata.terminology as item (item.term)}
			<div class="border-border rounded-lg border p-5">
				<p class="text-foreground mb-2 text-sm font-semibold">{item.term}</p>
				<p class="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Core Concepts -->
<Section.Root>
	<Section.Header>
		<Section.Title>Core concepts</Section.Title>
		<Section.Subtitle
			>Three ideas that make atoms different from a typical component library.</Section.Subtitle
		>
	</Section.Header>

	<div class="grid gap-4 md:grid-cols-3">
		{#each metadata.concepts as concept, i (i)}
			<div class="border-border bg-card rounded-lg border p-5">
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
						{@render conceptIcon(concept.icon)}
					</svg>
				</div>
				<p class="text-foreground mb-1.5 text-sm font-semibold">{concept.title}</p>
				<p class="text-muted-foreground text-sm leading-relaxed">{concept.description}</p>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Anatomy of an Atom -->
<Section.Root>
	<Section.Header>
		<Section.Title>Anatomy of an Atom</Section.Title>
		<Section.Subtitle>A simple example showing the key props and patterns.</Section.Subtitle>
	</Section.Header>

	<div class="mb-6 overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={metadata.examples.anatomy} />
	</div>

	<div class="grid gap-3 sm:grid-cols-3">
		{#each metadata.anatomyExample.features as feature, i (i)}
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-1 text-sm font-semibold">{feature.label}</p>
				<p class="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- When to Use Atoms -->
<Section.Root>
	<Section.Header>
		<Section.Title>When to use Atoms</Section.Title>
		<Section.Subtitle
			>Atoms shine when you need full control. Here's when to reach for them.</Section.Subtitle
		>
	</Section.Header>

	<div class="space-y-4">
		{#each metadata.whenToUse as useCase, i (i)}
			<div class="border-border rounded-lg border p-5">
				<div class="mb-2 flex items-center gap-2">
					<div
						class="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M20 6 9 17l-5-5" />
						</svg>
					</div>
					<p class="text-foreground text-sm font-semibold">{useCase.category}</p>
				</div>
				<p class="text-muted-foreground text-sm leading-relaxed">{useCase.description}</p>
				{#if useCase.features}
					<ul class="mt-3 space-y-1">
						{#each useCase.features as feature, j (j)}
							<li class="text-muted-foreground flex gap-2 text-sm">
								<span class="text-primary mt-0.5 shrink-0">·</span>
								<span>{feature.replace(/\*\*/g, '')}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Atoms vs Full Components -->
<Section.Root>
	<Section.Header>
		<Section.Title>Atoms vs full components</Section.Title>
		<Section.Subtitle>Understanding the tradeoff helps you choose the right tool.</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-4 sm:grid-cols-2">
		{#each [metadata.atomsVsComponents.atoms, metadata.atomsVsComponents.components] as comparison (comparison.title)}
			<div class="border-border bg-card rounded-lg border p-5">
				<p class="text-foreground mb-4 text-sm font-semibold">{comparison.title}</p>
				<ul class="space-y-2">
					{#each comparison.features as feature, i (i)}
						<li class="flex items-start gap-2 text-sm">
							<span
								class="{feature.positive
									? 'text-success'
									: 'text-muted-foreground/50'} mt-0.5 shrink-0 font-mono text-xs leading-5"
							>
								{feature.positive ? '+' : '−'}
							</span>
							<span class="text-muted-foreground">{feature.text}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Next Steps -->
<Section.Root class="mb-0">
	<Section.Header>
		<Section.Title>Next steps</Section.Title>
		<Section.Subtitle>Ready to go deeper?</Section.Subtitle>
	</Section.Header>

	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<div class="grid gap-3 sm:grid-cols-2">
		{#each metadata.gettingStartedLinks as link (link.href)}
			<a
				href={link.href}
				class="group border-border hover:border-primary/40 hover:bg-muted/30 flex items-center gap-4 rounded-lg border p-4 transition-all"
			>
				<div
					class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
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
						{#if link.icon === 'grid'}
							<rect width="7" height="7" x="3" y="3" rx="1" /><rect
								width="7"
								height="7"
								x="14"
								y="3"
								rx="1"
							/>
							<rect width="7" height="7" x="14" y="14" rx="1" /><rect
								width="7"
								height="7"
								x="3"
								y="14"
								rx="1"
							/>
						{:else if link.icon === 'book'}
							<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
							<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
						{/if}
					</svg>
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-foreground mb-0.5 text-sm font-semibold">{link.title}</p>
					<p class="text-muted-foreground text-xs leading-relaxed">{link.description}</p>
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
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</Section.Root>
