<script lang="ts">
	import { Section, CodeBlock } from '$docs/components';
	import { Button } from '$lib/components/button';
	import { metadata } from './shared';

	const globalPresetCode = `// +layout.svelte (App Root)
import { setPreset } from '@ixirjs/ui/preset';

setPreset({
  button: () => ({
    class: 'rounded-lg px-4 py-2 font-semibold transition-colors',
    variants: {
      variant: {
        primary: { class: 'bg-primary text-primary-foreground hover:bg-primary/90' },
        secondary: { class: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
        destructive: { class: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' }
      },
      size: {
        sm: { class: 'h-8 px-3 text-sm' },
        md: { class: 'h-10 px-4' },
        lg: { class: 'h-12 px-6 text-lg' }
      }
    },
    defaults: {
      variant: 'primary',
      size: 'md'
    }
  }),

  card: () => ({
    class: 'rounded-xl border border-border bg-card shadow-sm'
  }),

  'card.title': () => ({
    class: 'text-xl font-bold text-card-foreground'
  })
});`;

	const routePresetCode = `// routes/dashboard/+layout.svelte
import { setPreset } from '@ixirjs/ui/preset';

// Extends and overrides the global preset
setPreset({
  button: () => ({
    class: 'text-sm', // Merges with global button classes
    variants: {
      variant: {
        // Adds new variant, keeps primary, secondary, destructive
        info: { class: 'bg-blue-500 text-white hover:bg-blue-600' }
      }
    }
  }),

  card: () => ({
    class: 'bg-slate-50 border-slate-200' // Overrides global card styling
  })
});

// All buttons in /dashboard/* now have the extended variants`;

	const componentPresetCode = `<!-- components/Settings.svelte -->
<script>
  import { setPreset } from '@ixirjs/ui/preset';
  import { Card } from '@ixirjs/ui';

  setPreset({
    'card.title': () => ({
      class: 'text-purple-600' // Purple titles in settings only
    })
  });
<\x2Fscript>

<Card.Root>
  <Card.Header>
    <Card.Title>Settings</Card.Title> <!-- Purple! -->
  </Card.Header>
</Card.Root>`;

	const dynamicPresetCode = `import { definePreset, setPreset } from '@ixirjs/ui/preset';

setPreset(definePreset({
  // Reads inside the entry are tracked by the presentation kernel
  'accordion.item.header': ({ bond }) => ({
    class: bond?.isActive ? 'text-foreground' : 'text-foreground/50'
  }),

  'accordion.item.body': () => ({
    class: 'mt-2 overflow-hidden'
  })
}));`;

	const compoundPresetCode = `setPreset({
  // Parent component
  alert: () => ({
    class: 'relative rounded-lg border p-4',
    variants: {
      variant: {
        default: { class: 'bg-background text-foreground' },
        destructive: { class: 'bg-destructive/10 text-destructive border-destructive/50' },
        success: { class: 'bg-green-50 text-green-900 border-green-200' }
      }
    },
    defaults: {
      variant: 'default'
    }
  }),

  // Child components — dot notation
  'alert.icon': () => ({ class: 'h-4 w-4' }),
  'alert.title': () => ({ class: 'mb-1 font-semibold leading-tight' }),
  'alert.description': () => ({ class: 'text-sm leading-relaxed opacity-90' }),
  'alert.actions': () => ({ class: 'mt-3 flex items-center gap-2' })
});`;

	const placeholderCode = `<!-- Preset classes are inserted automatically -->
<script>
  import { HtmlAtom } from '@ixirjs/ui';
  let { class: klass = '' } = $props();
<\x2Fscript>

<HtmlAtom preset="button" class={['my-component-base', klass]} />

<!-- Order: preset classes → component/user classes; the consumer wins conflicts. -->`;

	const extendingCode = `// Base theme (global)
setPreset({
  button: () => ({
    class: 'rounded-md font-medium transition-colors',
    variants: {
      variant: {
        primary: { class: 'bg-blue-500 text-white' },
        secondary: { class: 'bg-gray-200 text-gray-900' }
      },
      size: {
        sm: { class: 'px-3 py-1 text-sm' },
        md: { class: 'px-4 py-2' }
      }
    }
  })
});

// Extended theme (route level) — deep merges with base
setPreset({
  button: () => ({
    variants: {
      variant: {
        // New variants added alongside primary and secondary
        gradient: { class: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
        outline: { class: 'border border-primary bg-transparent text-primary' }
      },
      size: {
        xl: { class: 'px-8 py-4 text-xl' } // New size alongside sm and md
      }
    }
  })
});

// Result: all variants available (primary, secondary, gradient, outline)
// All sizes available (sm, md, xl)`;

	const presetEntryTypeCode = `import { definePreset, setPreset } from '@ixirjs/ui/preset';

// PresetEntry: (context: { bond: Bond | null }) => PresetEntryRecord

setPreset(definePreset({
  // Static — returns a record directly
  card: () => ({
    class: 'rounded-xl border border-border bg-card',
    variants: {
      size: {
        sm: { class: 'p-3' },
        md: { class: 'p-5' }
      }
    },
    defaults: { size: 'md' }
  }),

  // Reactive reads happen directly inside the entry
  'accordion.item.header': ({ bond }) => ({
    class: bond?.isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
  }),

  // DOM attributes live in their own collision-safe namespace
  button: () => ({
    class: 'rounded-lg px-4 py-2',
    attrs: { 'data-component': 'button', role: 'button', tabindex: 0 }
  })
}));`;

	const bestPractices = [
		{
			num: '01',
			title: 'Set global presets at app root',
			description:
				'Define your base theme in +layout.svelte. Everything else inherits from this baseline.'
		},
		{
			num: '02',
			title: 'Override at route level for sections',
			description:
				'Use route layout files to customize entire sections (admin panel, dashboard, marketing) without touching the global theme.'
		},
		{
			num: '03',
			title: 'Use component-level presets sparingly',
			description:
				'Only when a specific subtree needs unique styling that cannot be expressed at route level.'
		},
		{
			num: '04',
			title: 'Use dot notation for compound components',
			description:
				"'card.title' targets exactly the title sub-component — more precise than overriding the whole card."
		},
		{
			num: '05',
			title: 'Read reactive state directly',
			description:
				'Read Bond values inside the entry callback; the presentation kernel tracks them without a second factory layer.'
		},
		{
			num: '06',
			title: 'Prefer presets for patterns, props for one-offs',
			description:
				'If only one instance needs a style, pass it via class prop. Presets are for reusable global patterns.'
		},
		{
			num: '07',
			title: 'Merge, do not replace',
			description:
				'setPreset deep-merges into the current context — extend existing presets rather than reimplementing from scratch.'
		}
	];

	const useCases = [
		{
			title: 'Multi-Tenant Applications',
			description:
				'Different organizations get their own branded themes. Set presets from tenant config at root without touching component code.'
		},
		{
			title: 'Dashboard vs Marketing Site',
			description:
				'Use route-level presets for compact dashboard styles and spacious marketing layouts — same components, different feel.'
		},
		{
			title: 'Component Library Theming',
			description:
				'Ship default presets with your library that consumers can override or extend at any level without forking components.'
		},
		{
			title: 'Accessibility Defaults',
			description:
				'Set aria-* attributes, role, and tabindex globally so every instance of a component starts accessible without per-use boilerplate.'
		}
	];
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
</svelte:head>

<!-- Hero -->
<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Preset System</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">
		Style once. Apply everywhere.
	</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		{metadata.pageDescription}
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/bonds" as="a" variant="primary" class="gap-2 px-5">
			Understand Bonds
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
		<Button href="/docs/atoms" as="a" variant="outline" class="px-5">Explore Atoms</Button>
	</div>
</div>

<!-- Overview -->
<Section.Root>
	<Section.Header>
		<Section.Title>What is the Preset System?</Section.Title>
		<Section.Subtitle>
			Define component styling globally and override it at any level of your application hierarchy.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-3 mb-8">
		<p class="text-muted-foreground leading-relaxed">
			The Preset System is a theming mechanism built on Svelte's context API. Set base styles at the
			app root, override them per route, or narrow them further per component subtree — all without
			changing the components themselves.
		</p>
		<p class="text-muted-foreground leading-relaxed">
			Presets deep-merge across context layers, so a route-level override only needs to specify what
			changes. The rest is inherited automatically.
		</p>
	</div>

	<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
		{#each metadata.keyFeatures as feature, i (i)}
			<div class="border-border rounded-lg border p-4">
				<div class="flex items-start gap-3">
					<div
						class="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="10"
							height="10"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M20 6 9 17l-5-5" />
						</svg>
					</div>
					<p class="text-muted-foreground text-sm leading-relaxed">{feature}</p>
				</div>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Preset Levels -->
<Section.Root>
	<Section.Header>
		<Section.Title>Preset Levels</Section.Title>
		<Section.Subtitle
			>Three scopes — global, route, component — each narrower than the last.</Section.Subtitle
		>
	</Section.Header>

	<div class="space-y-4">
		{#each metadata.presetLevels as level, i (i)}
			<div class="border-border rounded-lg border p-5">
				<div class="mb-3 flex items-start justify-between gap-4">
					<div>
						<p class="text-foreground text-sm font-semibold">{level.level}</p>
						<p class="text-muted-foreground mt-0.5 text-xs">{level.location}</p>
					</div>
					<span class="bg-primary/10 text-primary rounded px-2 py-0.5 font-mono text-xs">
						{String(i + 1).padStart(2, '0')}
					</span>
				</div>
				<div class="grid gap-3 sm:grid-cols-3">
					<div>
						<p class="text-foreground mb-0.5 text-xs font-semibold">Scope</p>
						<p class="text-muted-foreground text-xs">{level.scope}</p>
					</div>
					<div>
						<p class="text-foreground mb-0.5 text-xs font-semibold">Use case</p>
						<p class="text-muted-foreground text-xs">{level.useCase}</p>
					</div>
					<div>
						<p class="text-foreground mb-0.5 text-xs font-semibold">Priority</p>
						<p class="text-muted-foreground text-xs">{level.priority}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Global Preset -->
<Section.Root>
	<Section.Header>
		<Section.Title>Global preset configuration</Section.Title>
		<Section.Subtitle
			>Define your base theme at the application root for consistent styling across every page.</Section.Subtitle
		>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={globalPresetCode} />
	</div>
</Section.Root>

<!-- Route-Level Override -->
<Section.Root>
	<Section.Header>
		<Section.Title>Route-level overrides</Section.Title>
		<Section.Subtitle
			>Extend or override presets for specific routes — only specify what changes.</Section.Subtitle
		>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={routePresetCode} />
	</div>
</Section.Root>

<!-- Component-Level -->
<Section.Root>
	<Section.Header>
		<Section.Title>Component-level customization</Section.Title>
		<Section.Subtitle
			>Scope presets to a specific subtree without affecting the global theme.</Section.Subtitle
		>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={componentPresetCode} />
	</div>
</Section.Root>

<!-- Compound Components -->
<Section.Root>
	<Section.Header>
		<Section.Title>Compound component presets</Section.Title>
		<Section.Subtitle
			>Configure nested components with dot notation for precise sub-component control.</Section.Subtitle
		>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Use <code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
			>'parent.child'</code
		> notation to style sub-components independently. This is especially useful for compound components
		like Alert, Card, Dialog, and Accordion, where each part needs its own styling.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={compoundPresetCode} />
	</div>
</Section.Root>

<!-- Reactive State -->
<Section.Root>
	<Section.Header>
		<Section.Title>Reactive state-based styling</Section.Title>
		<Section.Subtitle
			>Access component Bond values for dynamic presets that update automatically.</Section.Subtitle
		>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Preset entries receive a context record containing the component Bond. Reactive reads made
		directly inside the entry are tracked by the presentation kernel and update automatically.
	</p>

	<div class="overflow-hidden rounded-lg mb-6">
		<CodeBlock lang="typescript" code={dynamicPresetCode} />
	</div>

	<div class="border-border bg-card rounded-lg border p-5">
		<p class="text-foreground mb-3 text-sm font-semibold">One entry shape</p>
		<p class="text-muted-foreground text-xs leading-relaxed">
			Every entry returns one closed record. Use <code
				class="bg-primary/10 text-primary font-mono text-xs"
				>&lbrace; bond &rbrace; =&gt; (&lbrace; class: bond?.isOpen ? 'open' : 'closed' &rbrace;)</code
			> when styling depends on component state.
		</p>
	</div>
</Section.Root>

<!-- Automatic class insertion -->
<Section.Root>
	<Section.Header>
		<Section.Title>Automatic class insertion</Section.Title>
		<Section.Subtitle
			>Preset classes require no sentinel or template-level protocol.</Section.Subtitle
		>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		The presentation kernel inserts preset classes automatically. Component and consumer classes are
		applied afterward, so local customization wins Tailwind conflicts.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={placeholderCode} />
	</div>
</Section.Root>

<!-- Extending Presets -->
<Section.Root>
	<Section.Header>
		<Section.Title>Extending and composing presets</Section.Title>
		<Section.Subtitle
			>Build upon existing preset definitions with automatic deep merging.</Section.Subtitle
		>
	</Section.Header>

	<p class="text-muted-foreground mb-6 leading-relaxed">
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-sm"
			>setPreset()</code
		> always merges into the existing context. Variants, sizes, and other nested records are combined
		— you never lose what was already defined at a higher level.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={extendingCode} />
	</div>
</Section.Root>

<!-- Best Practices -->
<Section.Root>
	<Section.Header>
		<Section.Title>Best practices</Section.Title>
		<Section.Subtitle>Guidelines for effective preset architecture.</Section.Subtitle>
	</Section.Header>

	<div class="border-border divide-border overflow-hidden rounded-lg border divide-y">
		{#each bestPractices as practice (practice.num)}
			<div class="flex gap-4 p-5">
				<span class="text-primary shrink-0 font-mono text-xs font-semibold pt-0.5"
					>{practice.num}</span
				>
				<div>
					<p class="text-foreground mb-1 text-sm font-semibold">{practice.title}</p>
					<p class="text-muted-foreground text-sm leading-relaxed">{practice.description}</p>
				</div>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Common Use Cases -->
<Section.Root>
	<Section.Header>
		<Section.Title>Common use cases</Section.Title>
		<Section.Subtitle>Real-world scenarios where the preset system shines.</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2">
		{#each useCases as useCase (useCase.title)}
			<div class="border-border bg-card rounded-lg border p-5">
				<p class="text-foreground mb-2 text-sm font-semibold">{useCase.title}</p>
				<p class="text-muted-foreground text-sm leading-relaxed">{useCase.description}</p>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- API Reference -->
<Section.Root class="mb-0">
	<Section.Header>
		<Section.Title>API reference</Section.Title>
		<Section.Subtitle>Core functions and types for the preset system.</Section.Subtitle>
	</Section.Header>

	<div class="border-border divide-border overflow-hidden rounded-lg border divide-y">
		<div class="p-5">
			<div class="mb-3 flex items-center gap-3">
				<code class="bg-primary/10 text-primary rounded px-2 py-1 font-mono text-sm"
					>setPreset(preset)</code
				>
			</div>
			<p class="text-muted-foreground mb-3 text-sm leading-relaxed">
				Sets or deep-merges preset configuration into the current Svelte context. Call at component
				init time in any <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
					>+layout.svelte</code
				> or component.
			</p>
			<div class="bg-muted/30 rounded-lg p-3">
				<code class="text-muted-foreground text-xs"
					>setPreset(preset: Partial&lt;Preset&gt;): void</code
				>
			</div>
		</div>

		<div class="p-5">
			<div class="mb-3 flex items-center gap-3">
				<code class="bg-primary/10 text-primary rounded px-2 py-1 font-mono text-sm"
					>definePreset(preset)</code
				>
			</div>
			<p class="text-muted-foreground mb-3 text-sm leading-relaxed">
				Checks built-in and application-augmented keys while preserving precise entry inference.
			</p>
			<div class="bg-muted/30 rounded-lg p-3">
				<code class="text-muted-foreground text-xs"
					>definePreset&lt;P extends Partial&lt;Preset&gt;&gt;(preset: P): P</code
				>
			</div>
		</div>

		<div class="p-5">
			<div class="mb-3 flex items-center gap-3">
				<code class="bg-primary/10 text-primary rounded px-2 py-1 font-mono text-sm"
					>fallbackPreset(...) / mergePresetLayers(...)</code
				>
			</div>
			<p class="text-muted-foreground mb-3 text-sm leading-relaxed">
				Named operations distinguish first-available key fallback from ordered record merging. Plain
				arrays intentionally have no preset semantics.
			</p>
		</div>

		<div class="p-5">
			<div class="mb-3 flex items-center gap-3">
				<code class="bg-primary/10 text-primary rounded px-2 py-1 font-mono text-sm"
					>PresetEntry</code
				>
			</div>
			<p class="text-muted-foreground mb-3 text-sm leading-relaxed">
				Each entry receives one extensible context record and returns one closed presentation
				record.
			</p>
			<div class="bg-muted/30 rounded-lg p-3">
				<code class="text-muted-foreground text-xs"
					>type PresetEntry = (context: PresetContext) =&gt; PresetEntryRecord</code
				>
			</div>
		</div>
	</div>

	<div class="mt-6 overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={presetEntryTypeCode} />
	</div>
</Section.Root>
