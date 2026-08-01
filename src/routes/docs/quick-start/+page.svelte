<script lang="ts">
	import DocCodeBlock from '$docs/components/doc-code-block.svelte';
	import { Button } from '$lib/components/button';
	import { layoutCode, appCssCode, presetCode, firstComponentCode } from './codes';
	import { Section, DocCallout } from '$docs/components';

	let packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' = $state('npm');
	let copied = $state(false);

	const installCommands: Record<'npm' | 'pnpm' | 'yarn' | 'bun', string> = {
		npm: 'npm install @ixirjs/ui',
		pnpm: 'pnpm add @ixirjs/ui',
		yarn: 'yarn add @ixirjs/ui',
		bun: 'bun add @ixirjs/ui'
	};

	function copy() {
		navigator.clipboard.writeText(installCommands[packageManager]).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1500);
		});
	}

	const requirements = [
		{
			name: 'Svelte 5',
			detail: '^5.46.4 or later',
			icon: 'svelte'
		},
		{
			name: 'Tailwind CSS v4',
			detail: 'CSS-first configuration',
			icon: 'tailwind'
		},
		{
			name: 'Node.js 18+',
			detail: 'Modern runtime',
			icon: 'node'
		}
	];

	const nextSteps = [
		{
			title: 'Browse Components',
			description: 'Explore the full library of accessible, composable components.',
			href: '/docs/components/button',
			icon: 'grid'
		},
		{
			title: 'Learn the Philosophy',
			description: 'Understand the Atom → Bond → Preset architecture.',
			href: '/docs/philosophy',
			icon: 'book'
		},
		{
			title: 'Styling Guide',
			description: 'Own every pixel via the Preset system and CSS variables.',
			href: '/docs/styling',
			icon: 'palette'
		},
		{
			title: 'Accessibility',
			description: 'Built-in keyboard navigation, ARIA roles, and focus management.',
			href: '/docs/accessibility',
			icon: 'shield'
		}
	];
</script>

<svelte:head>
	<title>Quick Start — Svelte Atoms</title>
	<meta
		name="description"
		content="Install and configure Svelte Atoms in minutes. Step-by-step guide covering installation, Tailwind setup, presets, and your first component."
	/>
</svelte:head>

{#snippet requirementIcon(icon: string)}
	{#if icon === 'svelte'}
		<path
			d="M20.33 3.67c-2.17-2.17-5.57-2.17-7.74 0L4 12.26c-2.17 2.17-2.17 5.57 0 7.74s5.57 2.17 7.74 0l4.8-4.8"
		/>
		<path
			d="M3.67 20.33c2.17 2.17 5.57 2.17 7.74 0l8.59-8.59c2.17-2.17 2.17-5.57 0-7.74s-5.57-2.17-7.74 0l-4.8 4.8"
		/>
	{:else if icon === 'tailwind'}
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path
			d="M8 12c0-2.21 1.79-4 4-4 1.47 0 2.75.79 3.45 1.97"
			stroke-dasharray="2 2"
		/>
	{:else if icon === 'node'}
		<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
	{/if}
{/snippet}

{#snippet nextStepIcon(icon: string)}
	{#if icon === 'grid'}
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
	{:else if icon === 'book'}
		<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path
			d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
		/>
	{:else if icon === 'palette'}
		<circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle
			cx="8.5"
			cy="7.5"
			r=".5"
		/>
		<circle cx="6.5" cy="12.5" r=".5" />
		<path
			d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
		/>
	{:else if icon === 'shield'}
		<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
	{/if}
{/snippet}

<!-- Hero -->
<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Quick Start</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">Up and running in minutes.</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		Install, configure, and ship your first component — this guide covers everything from package
		installation to a working preset.
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/components/button" as="a" variant="primary" class="gap-2 px-5">
			Browse components
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
		<Button href="/docs/philosophy" as="a" variant="outline" class="px-5"
			>Read the philosophy</Button
		>
	</div>
</div>

<!-- Requirements -->
<Section.Root>
	<Section.Header>
		<Section.Title>Requirements</Section.Title>
		<Section.Subtitle
			>Make sure your project meets these prerequisites before installing.</Section.Subtitle
		>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-3">
		{#each requirements as req (req.name)}
			<div class="border-border bg-card flex items-center gap-3 rounded-lg border p-4">
				<div
					class="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
				>
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
						aria-hidden="true"
					>
						{@render requirementIcon(req.icon)}
					</svg>
				</div>
				<div class="min-w-0">
					<p class="text-foreground text-sm font-semibold">{req.name}</p>
					<p class="text-muted-foreground text-xs">{req.detail}</p>
				</div>
				<svg
					class="text-success ml-auto shrink-0"
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
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
		{/each}
	</div>
</Section.Root>

<!-- Installation -->
<Section.Root>
	<Section.Header>
		<Section.Title>Installation</Section.Title>
		<Section.Subtitle>
			Install <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-sm font-mono"
				>@ixirjs/ui</code
			> with your preferred package manager.
		</Section.Subtitle>
	</Section.Header>

	<div class="border-border overflow-hidden rounded-lg border">
		<!-- Tabs -->
		<div class="bg-muted/40 border-border/60 flex gap-1 border-b px-3 pt-2">
			{#each ['npm', 'pnpm', 'yarn', 'bun'] as pm (pm)}
				<button
					onclick={() => (packageManager = pm as typeof packageManager)}
					class="rounded-t-md px-3.5 py-1.5 text-xs font-semibold transition-colors {packageManager ===
					pm
						? 'bg-background text-foreground border-border border border-b-background -mb-px'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{pm}
				</button>
			{/each}
		</div>

		<!-- Command -->
		<div class="flex items-center gap-3 px-5 py-4">
			<span class="text-muted-foreground font-mono text-sm">$</span>
			<code class="text-foreground flex-1 font-mono text-sm">{installCommands[packageManager]}</code
			>
			<button
				onclick={copy}
				title="Copy to clipboard"
				aria-label="Copy install command"
				class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
			>
				{#if copied}
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
						class="text-success"
						aria-hidden="true"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				{:else}
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
						aria-hidden="true"
					>
						<rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
							d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</Section.Root>

<!-- Configuration -->
<Section.Root>
	<Section.Header>
		<Section.Title>Configuration</Section.Title>
		<Section.Subtitle
			>Three quick steps to wire up foundation styles, Tailwind, and component defaults.</Section.Subtitle
		>
	</Section.Header>

	<!-- Step 1 -->
	<div class="relative pl-11">
		<div class="absolute left-0 top-0 flex flex-col items-center">
			<div
				class="bg-primary text-primary-foreground z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
			>
				1
			</div>
			<div class="bg-border mt-2 w-px flex-1"></div>
		</div>
		<div class="pb-10 pt-0.5">
			<p class="text-foreground mb-1 text-sm font-semibold">Import foundation styles</p>
			<p class="text-muted-foreground mb-4 text-sm">
				Add the public foundation stylesheet to your root layout so the library’s design tokens load
				on every page.
			</p>
			<DocCodeBlock filepath="src/routes/+layout.svelte" language="Svelte" code={layoutCode} />
			<div class="mt-3">
				<DocCallout variant="warning" title="Order matters">
					Import component styles before <code class="font-mono text-xs">app.css</code> to ensure correct
					cascade order.
				</DocCallout>
			</div>
		</div>
	</div>

	<!-- Step 2 -->
	<div class="relative pl-11">
		<div class="absolute left-0 top-0 flex flex-col items-center">
			<div
				class="bg-primary text-primary-foreground z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
			>
				2
			</div>
			<div class="bg-border mt-2 w-px flex-1"></div>
		</div>
		<div class="pb-10 pt-0.5">
			<p class="text-foreground mb-1 text-sm font-semibold">Set up Tailwind CSS</p>
			<p class="text-muted-foreground mb-4 text-sm">
				Add the Tailwind import and CSS design tokens to your <code class="font-mono text-xs"
					>app.css</code
				>. These variables power light/dark theming.
			</p>
			<DocCodeBlock filepath="src/app.css" language="CSS" code={appCssCode} />
			<div class="mt-3">
				<DocCallout variant="note" title="Source scanning">
					Use <code class="font-mono text-xs"
						>@source './../node_modules/@ixirjs/ui/**/*.{'{'}js,ts,svelte{'}'}';</code
					>
					so Tailwind detects library utility classes.
				</DocCallout>
			</div>
		</div>
	</div>

	<!-- Step 3 -->
	<div class="relative pl-11">
		<div class="absolute left-0 top-0 flex flex-col items-center">
			<div
				class="bg-primary text-primary-foreground z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
			>
				3
			</div>
		</div>
		<div class="pt-0.5">
			<p class="text-foreground mb-1 text-sm font-semibold">Configure the component preset</p>
			<p class="text-muted-foreground mb-4 text-sm">
				Define your design system once — variants, default classes, and slot overrides — with a
				single <code class="font-mono text-xs">setPreset()</code> call.
			</p>
			<DocCodeBlock filepath="src/preset.ts" language="TypeScript" code={presetCode} />
		</div>
	</div>
</Section.Root>

<!-- First Component -->
<Section.Root>
	<Section.Header>
		<Section.Title>Your first component</Section.Title>
		<Section.Subtitle>With everything configured, import and render a Button.</Section.Subtitle>
	</Section.Header>

	<DocCodeBlock filepath="src/routes/+page.svelte" language="Svelte" code={firstComponentCode} />

	<div class="mt-3">
		<DocCallout variant="success" title="You're ready">
			Button includes a built-in presentation baseline. Add preset entries or classes as you use
			more components.
		</DocCallout>
	</div>
</Section.Root>

<!-- Next Steps -->
<Section.Root>
	<Section.Header>
		<Section.Title>Next steps</Section.Title>
		<Section.Subtitle>Go deeper with components, architecture, and styling.</Section.Subtitle>
	</Section.Header>

	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<div class="grid gap-3 sm:grid-cols-2">
		{#each nextSteps as step (step.href)}
			<a
				href={step.href}
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
						{@render nextStepIcon(step.icon)}
					</svg>
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-foreground mb-0.5 text-sm font-semibold">{step.title}</p>
					<p class="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
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

<!-- Help -->
<Section.Root class="mb-0">
	<div class="border-border rounded-lg border p-5">
		<p class="text-foreground mb-1 text-sm font-semibold">Need help?</p>
		<p class="text-muted-foreground mb-4 text-sm">
			Check the GitHub repository for examples, open issues, and discussions.
		</p>
		<a
			href="https://github.com/ixirjs/ui"
			target="_blank"
			rel="noopener noreferrer"
			class="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
		>
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
				aria-hidden="true"
			>
				<path
					d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
				/>
				<path d="M9 18c-4.51 2-5-2-7-2" />
			</svg>
			View on GitHub
		</a>
	</div>
</Section.Root>
