<script lang="ts">
	import { Section, DocCode } from '$docs/components';
	import { components } from '$docs/registry';
	import { quickLinks } from '$docs/nav';

	const concepts = [
		{
			title: 'Components',
			sig: '<Dialog.Root>',
			description:
				'Accessible semantic components stay flexible through snippets, presets, and native element props.',
			href: '/docs/components'
		},
		{
			title: 'Bonds',
			sig: 'DialogBond',
			description:
				'Shared state, context, registered Atoms, and compound coordination without prop drilling.',
			href: '/docs/bonds'
		},
		{
			title: 'Preset system',
			sig: 'setPreset({…})',
			description:
				'One setPreset() call defines your entire design system. Override globally or per instance without specificity battles.',
			href: '/docs/preset'
		},
		{
			title: 'TypeScript',
			sig: 'ButtonProps',
			description:
				'Full type inference for variants, Atoms, capabilities and Bond props. Catch mistakes at author time.',
			href: '/docs/quick-start'
		},
		{
			title: 'WAI-ARIA',
			sig: 'aria-controls',
			description:
				'Keyboard navigation, focus management and ARIA roles are built into every component by default — not bolted on.',
			href: '/docs/accessibility'
		},
		{
			title: 'Svelte 5 runes',
			sig: '$state / $derived',
			description:
				"Purpose-built for $state, $derived and $effect. Embraces Svelte 5's reactive model rather than working around it.",
			href: '/docs/philosophy'
		}
	];

	const steps = [
		{
			n: '1',
			title: 'Install the package',
			file: 'terminal',
			body: 'Nothing is styled yet — this step only adds the primitives and their types.',
			lang: 'bash' as const,
			code: 'bun add @ixirjs/ui'
		},
		{
			n: '2',
			title: 'Import the foundation styles',
			file: 'src/routes/+layout.svelte',
			body: 'One stylesheet, carrying the reset and the layer variables every portal surface reads.',
			lang: 'typescript' as const,
			code: "import '@ixirjs/ui/styles/root.css';"
		},
		{
			n: '3',
			title: 'Import and use a component',
			file: 'src/routes/+page.svelte',
			body: 'Unstyled until your preset says otherwise — behaviour and accessibility are already there.',
			lang: 'svelte' as const,
			code:
				"<script>\n  import { Button } from '@ixirjs/ui/components/button';\n<" +
				'/script>\n\n<Button>Click me</Button>'
		}
	];
</script>

<svelte:head>
	<title>Documentation — IXIR UI</title>
	<meta
		name="description"
		content="Complete documentation for @ixirjs/ui — a headless, composable Svelte 5 component library built on Atoms, Bonds and the Preset system."
	/>
</svelte:head>

<div class="animate-page-in max-w-[760px]">
	<p class="text-muted-foreground m-0 mb-2.5 font-mono text-[11px] tracking-[0.05em] uppercase">
		Documentation
	</p>
	<h1 class="font-display m-0 mb-3 text-[32px] font-bold tracking-[-0.025em]">
		Everything you need.
	</h1>
	<p class="text-muted-foreground m-0 mb-5 text-[17px] leading-[1.65]">
		From installation to advanced architecture — every page for building with @ixirjs/ui.
	</p>

	<div class="mb-8 flex flex-wrap gap-2.5">
		<a
			href="/docs/quick-start"
			class="bg-primary text-primary-foreground inline-flex h-10 items-center gap-[7px] rounded-[7px] px-4 text-sm font-medium transition-opacity hover:opacity-90"
		>
			Get started
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"
			>
				<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
			</svg>
		</a>
		<a
			href="/docs/components"
			class="border-border hover:border-border-strong text-foreground inline-flex h-10 items-center rounded-[7px] border px-4 text-sm font-medium transition-colors"
			>Browse {components.length} components</a
		>
	</div>

	<Section.Root>
		<Section.Header>
			<Section.Title>Jump to</Section.Title>
		</Section.Header>
		<div class="border-border flex flex-col border-t">
			{#each quickLinks as link (link.href)}
				<a
					href={link.href}
					class="border-border hover:bg-bg-subtle text-foreground flex items-baseline gap-4 border-b px-1 py-3.5 transition-colors"
				>
					<span class="text-fg-faint w-[112px] shrink-0 font-mono text-[11px]"
						>{link.group.toLowerCase()}</span
					>
					<span class="text-sm font-medium">{link.label}</span>
					<span class="text-muted-foreground ml-auto hidden text-[13px] sm:block"
						>{link.summary}</span
					>
				</a>
			{/each}
		</div>
	</Section.Root>

	<Section.Root>
		<Section.Header>
			<Section.Title>Core concepts</Section.Title>
			<Section.Subtitle>
				Atoms, Bonds, capabilities and presets give you control over behaviour, state and style.
			</Section.Subtitle>
		</Section.Header>
		<div
			class="bg-border border-border grid grid-cols-3 gap-px overflow-hidden rounded-[10px] border max-[900px]:grid-cols-2 max-[640px]:grid-cols-1"
		>
			{#each concepts as concept (concept.href)}
				<a
					href={concept.href}
					class="bg-surface hover:bg-bg-subtle text-foreground flex flex-col gap-2 p-[22px] transition-colors"
				>
					<span class="font-display text-base font-semibold">{concept.title}</span>
					<code class="text-primary font-mono text-xs">{concept.sig}</code>
					<p class="text-muted-foreground m-0 text-[13px] leading-[1.6]">{concept.description}</p>
				</a>
			{/each}
		</div>
	</Section.Root>

	<Section.Root>
		<Section.Header>
			<Section.Title>Getting started</Section.Title>
			<Section.Subtitle>Up and running in three steps.</Section.Subtitle>
		</Section.Header>
		<div class="flex flex-col gap-8">
			{#each steps as step (step.n)}
				<div class="grid grid-cols-[32px_minmax(0,1fr)] gap-4">
					<span
						class="border-accent-line bg-accent-soft text-primary inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border font-mono text-xs"
						>{step.n}</span
					>
					<div class="min-w-0">
						<h3 class="font-display m-0 mt-0.5 mb-2 text-[18px] font-semibold tracking-[-0.015em]">
							{step.title}
						</h3>
						<p class="text-muted-foreground m-0 mb-3 text-[14.5px] leading-[1.7]">{step.body}</p>
						<DocCode code={step.code} lang={step.lang} filepath={step.file} />
					</div>
				</div>
			{/each}
		</div>
		<p class="mt-1 text-sm">
			<a href="/docs/quick-start" class="text-primary font-medium"
				>Full setup guide — Tailwind config, preset customisation and more →</a
			>
		</p>
	</Section.Root>
</div>
